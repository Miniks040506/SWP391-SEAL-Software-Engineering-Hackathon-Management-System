package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.*;
import com.t7.seal.request.round.*;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.round.*;
import com.t7.seal.response.team.TeamAdvancementDecisionResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.RoundService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class RoundServiceImpl implements RoundService {

    private final HackathonEventRepository hackathonEventRepository;
    private final RoundRepository roundRepository;
    private final AdvanceRuleRepository advanceRuleRepository;
    private final TrackRepository trackRepository;
    private final AuditLogRepository auditLogRepository;
    private final SubmissionRepository submissionRepository;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final NotificationService notificationService;
    private final ScoreRepository scoreRepository;
    private final RankingRepository rankingRepository;
    private final TeamRepository teamRepository;

    private final CurrentUserService currentUserService;

    @Transactional
    @Override
    public RoundResponse createRound(UUID eventId, CreateRoundRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        HackathonEvent event = hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        assertTrackRoundEditable(event);

        validateCreateRoundRequest(request);

        if (roundRepository.existsByEventIdAndOrderIndex(eventId, request.orderIndex())) {
            throw new ConflictException("Round orderIndex already exists in this event");
        }

        if (roundRepository.existsByEventIdAndNameIgnoreCase(eventId, request.name().trim())) {
            throw new ConflictException("Round with this name already exists in this event");
        }

        Round round = new Round();
        round.setEvent(event);
        round.setName(trimToNull(request.name()));
        round.setDescription(trimToNull(request.description()));
        round.setOrderIndex(request.orderIndex());
        round.setStatus(RoundStatus.UPCOMING);
        round.setIsFinal(Boolean.TRUE.equals(request.isFinal()));
        round.setSubmissionDeadline(request.submissionDeadline());
        round.setJudgingDeadline(request.judgingDeadline());

        Round saved = roundRepository.save(round);

        return toRoundResponse(saved);
    }

    @Transactional(readOnly = true)
    @Override
    public List<RoundResponse> getRoundsByEvent(UUID eventId, Authentication authentication) {

        User user = currentUserService.getCurrentUser(authentication);

        List<Round> round;

        if (user.getRole() == UserRole.COORDINATOR) {
            round = roundRepository.findByEventIdOrderByOrderIndexAsc(eventId);
        } else {
            round = roundRepository.findPublicByEventIdOrderByOrderIndexAsc(eventId);
        }

        return round.stream()
                .map(this::toRoundResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public RoundDetailResponse getRoundById(UUID roundId, Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);

        Round round;

        if (user.getRole() == UserRole.COORDINATOR) {
            round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
        } else {
            round = roundRepository.findPublicById(roundId)
                    .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
        }

        return new RoundDetailResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getName(),
                round.getDescription(),
                round.getOrderIndex(),
                round.getIsFinal(),
                round.getStatus().name(),
                round.getSubmissionDeadline(),
                round.getJudgingDeadline(),
                round.getSubmissionLockedAt(),
                round.getGradingLockedAt(),
                round.getAdvancementConfirmedAt()
        );
    }

    @Transactional
    @Override
    public RoundResponse updateRound(UUID roundId, UpdateRoundRequest request, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        assertTrackRoundEditable(round.getEvent());

        if (request.name() != null) {
            String name = trimToNull(request.name());

            if (name.isBlank()) {
                throw new BadRequestException("Round name is required");
            }

            round.setName(name);
        }

        if (request.description() != null) {
            round.setDescription(trimToNull(request.description()));
        }

        if (request.orderIndex() != null) {
            if (request.orderIndex() < 0) {
                throw new BadRequestException("Round orderIndex must not be negative");
            }

            if (!request.orderIndex().equals(round.getOrderIndex())
                    && roundRepository.existsByEventIdAndOrderIndex(round.getEvent().getId(), request.orderIndex())) {
                throw new ConflictException("Round orderIndex already exists in this event");
            }

            round.setOrderIndex(request.orderIndex());
        }

        if (request.submissionDeadline() != null) {
            boolean changesSubmissionDeadline = !request.submissionDeadline().equals(round.getSubmissionDeadline());
            if (changesSubmissionDeadline && round.getSubmissionLockedAt() != null) {
                throw new ConflictException("Cannot change submissionDeadline after submissions are locked");
            }

            if (changesSubmissionDeadline) {
                round.setSubmissionDeadline(request.submissionDeadline());
            }
        }

        if (request.judgingDeadline() != null) {
            boolean changesJudgingDeadline = !request.judgingDeadline().equals(round.getJudgingDeadline());
            if (changesJudgingDeadline && round.getGradingLockedAt() != null) {
                throw new ConflictException("Cannot change judgingDeadline after grading is locked");
            }

            if (changesJudgingDeadline) {
                round.setJudgingDeadline(request.judgingDeadline());
            }
        }

        validateDeadlines(round.getSubmissionDeadline(), round.getJudgingDeadline());

        if (request.isFinal() != null) {
            round.setIsFinal(request.isFinal());
        }

        if (request.status() != null && !request.status().isBlank()) {
            // Round status transition validation is intentionally handled by dedicated workflow endpoints.
            round.setStatus(parseEnum(RoundStatus.class, request.status(), "status"));
        }

        Round saved = roundRepository.save(round);

        return toRoundResponse(saved);
    }

    @Transactional
    @Override
    public void deleteRound(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        assertTrackRoundEditable(round.getEvent());

        if (round.getSubmissionLockedAt() != null
                || round.getGradingLockedAt() != null
                || round.getAdvancementConfirmedAt() != null) {
            throw new ConflictException("Cannot delete a round that has been locked or had advancement confirmed");
        }

        roundRepository.delete(round);
    }

    @Transactional(readOnly = true)
    @Override
    public List<AdvanceRuleResponse> getAdvanceRules(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        ensureRoundExist(roundId);

        return advanceRuleRepository.findByRoundIdOrderByPriorityAscRuleTypeAsc(roundId)
                .stream()
                .map(this::toAdvanceRuleResponse)
                .toList();
    }

    @Transactional
    @Override
    public AdvanceRuleResponse createAdvanceRule(
            UUID roundId,
            CreateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        assertAdvanceRuleEditable(round);

        RuleType ruleType = parseEnum(RuleType.class, request.ruleType(), "ruleType");

        Track track = resolveOptionalTrack(request.trackId(), round);

        assertNoDuplicateAdvanceRule(roundId, ruleType, track == null ? null : track.getId());

        Float value = resolveRuleValue(ruleType, request.topN(),
                request.topPercent(), request.minScore(), request.wildCardSlots());

        AdvanceRule advanceRule = AdvanceRule.builder()
                .round(round)
                .track(track)
                .ruleType(ruleType)
                .priority(resolvePriority(request.priority(), ruleType))
                .value(value)
                .description(trimToNull(request.description()))
                .build();

        return toAdvanceRuleResponse(advanceRuleRepository.save(advanceRule));
    }

    @Transactional
    @Override
    public AdvanceRuleResponse updateAdvanceRule(
            UUID advanceRuleId,
            UpdateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        currentUserService.getCurrentUser(authentication);

        AdvanceRule advanceRule = getAdvanceRule(advanceRuleId);

        assertAdvanceRuleEditable(advanceRule.getRound());

        if (request.active() != null && !request.active()) {
            throw new BadRequestException("Advance rule does not support inactive state yet.");
        }

        RuleType nextRuleType = request.ruleType() == null
                ? advanceRule.getRuleType()
                : parseEnum(RuleType.class, request.ruleType(), "ruleType");

        Track nextTrack = resolveNextTrack(advanceRule.getRound(), request, advanceRule.getTrack());

        assertNoDuplicateAdvanceRuleOnUpdate(
                advanceRule.getRound().getId(),
                nextRuleType,
                nextTrack == null ? null : nextTrack.getId(),
                advanceRule.getId()
        );

        if (request.description() != null) {
            advanceRule.setDescription(trimToNull(request.description()));
        }

        if (request.priority() != null) {
            advanceRule.setPriority(resolvePriority(request.priority(), nextRuleType));
        } else if (request.ruleType() != null && !request.ruleType().isBlank()) {
            advanceRule.setPriority(priorityFor(nextRuleType));
        }

        advanceRule.setRuleType(nextRuleType);
        advanceRule.setTrack(nextTrack);


        if (request.ruleType() != null || hasRuleValuePatch(request)) {
            advanceRule.setValue(resolveRuleValue(
                    nextRuleType,
                    request.topN(),
                    request.topPercent(),
                    request.minScore(),
                    request.wildCardSlots()
            ));
        }

        return toAdvanceRuleResponse(advanceRuleRepository.save(advanceRule));
    }

    @Transactional
    @Override
    public void deleteAdvanceRule(UUID advanceRuleId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        AdvanceRule advanceRule = getAdvanceRule(advanceRuleId);

        assertAdvanceRuleEditable(advanceRule.getRound());

        advanceRuleRepository.delete(advanceRule);
    }

    @Transactional
    @Override
    public RoundResponse openRound(UUID roundId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = getRound(roundId);

        if (round.getEvent().getStatus() != RegistrationStatus.ONGOING) {
            throw new ConflictException("Round cannot be opened in this status "
                    + round.getEvent().getStatus() + ".");
        }

        if (round.getStatus() != RoundStatus.UPCOMING
                && round.getStatus() != RoundStatus.CLOSED) {
            throw new ConflictException("Only upcoming and closed rounds can be opened.");
        }

        if (round.getSubmissionLockedAt() != null) {
            throw new ConflictException("Cannot re-open round that submissions are locked.");
        }

        RoundStatus before = round.getStatus();
        round.setStatus(RoundStatus.OPEN);
        Round saved = roundRepository.save(round);
        saveRoundAudit(actor, round, AuditActionType.ROUND_OPEN, before.name(), saved.getStatus().name());

        saveRoundNotification(actor, round, NotificationType.ROUND_OPENED, "Round open", "Round " + saved.getName());
        return toRoundResponse(saved);
    }

    @Transactional
    @Override
    public RoundResponse closeRound(UUID roundId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = getRound(roundId);

        if (round.getStatus() != RoundStatus.OPEN) {
            throw new ConflictException("Only open rounds can be closed.");
        }

        RoundStatus before = round.getStatus();
        round.setStatus(RoundStatus.CLOSED);
        Round saved = roundRepository.save(round);
        saveRoundAudit(actor, round, AuditActionType.ROUND_CLOSED, before.name(), saved.getStatus().name());

        saveRoundNotification(actor, round, NotificationType.ROUND_CLOSED, "Round closed", "Round " + saved.getName());
        return toRoundResponse(saved);
    }

    @Transactional
    @Override
    public RoundLockResponse lockSubmission(UUID roundId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = getRound(roundId);

        if (round.getSubmissionLockedAt() != null) {
            throw new ConflictException("This round submissions are already locked.");
        }

        if (round.getStatus() != RoundStatus.OPEN
                && round.getStatus() != RoundStatus.CLOSED) {
            throw new ConflictException("Round cannot be locked in this status " + round.getStatus() + ".");
        }

        LocalDateTime now = LocalDateTime.now();
        RoundStatus before = round.getStatus();
        round.setSubmissionLockedAt(now);
        round.setStatus(RoundStatus.CLOSED);
        Round saved = roundRepository.save(round);

        List<Submission> drafts = submissionRepository.findDraftsByRoundId(saved.getId());
        drafts.forEach(draft -> draft.setStatus(SubmissionStatus.LATE));

        submissionRepository.saveAll(drafts);

        List<RoundJudgeAssignment> judgeAssignments = roundJudgeAssignmentRepository.findByRoundIdWithJudgeAndTrack(saved.getId());

        for (RoundJudgeAssignment judgeAssignment : judgeAssignments) {
            UUID trackId = judgeAssignment.getTrack() == null ? null
                    : judgeAssignment.getTrack().getId();
            judgeAssignment.setTotalToScore((int) submissionRepository
                    .countSubmittedOrLateByRoundAndTrackNullable(roundId, trackId));
        }

        roundJudgeAssignmentRepository.saveAll(judgeAssignments);

        saveRoundAudit(actor, round, AuditActionType.ROUND_LOCKED, before.name(), saved.getStatus().name());
        saveRoundNotification(actor, round, NotificationType.SUBMISSION_LOCKED, "Submission locked", "Submission are locked for this " + saved.getName());
        saveRoundNotification(actor, round, NotificationType.JUDGING_READY, "Judging ready", "Judging queue is ready for " + saved.getName());

        return new RoundLockResponse(
                saved.getId(),
                "Submission",
                now,
                "Round submission locked successfully"
        );
    }

    @Transactional(readOnly = true)
    @Override
    public RoundOperationStatusResponse getOperationStatus(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);

        Round round = getRound(roundId);

        return toRoundOperationStatus(round);
    }

    @Transactional
    @Override
    public RoundLockResponse lockGrading(UUID roundId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = getRound(roundId);

        if (round.getSubmissionLockedAt() == null) {
            throw new ConflictException("Submission must be locked before grading can be locked.");
        }
        if (round.getGradingLockedAt() != null) {
            throw new ConflictException("Grading is already locked for this round.");
        }

        if (countCriteriaForRound(round) == 0) {
            throw new ConflictException(
                    "At least one active scoring criterion is required before locking grading.");
        }

        ScoringProgressResponse progress = buildScoringProgress(round);
        if (progress.total() == 0) {
            throw new ConflictException(
                    "At least one assigned submission is required before locking grading.");
        }

        LocalDateTime now = LocalDateTime.now();
        RoundStatus before = round.getStatus();
        round.setGradingLockedAt(now);
        round.setStatus(RoundStatus.RESULTS_READY);
        Round saved = roundRepository.save(round);

        saveRoundAudit(actor, saved, AuditActionType.GRADING_LOCKED, before.name(), saved.getStatus().name());
        saveRoundNotification(actor, saved, NotificationType.JUDGING_READY, "Grading locked",
                "Grading has been locked for round " + saved.getName() + ". Rankings can now be calculated.");

        return new RoundLockResponse(
                saved.getId(),
                "Grading",
                now,
                "Round grading locked successfully (" + progress.completed() + "/" + progress.total() + " assigned submissions completed)."
        );
    }

    @Override
    @Transactional(readOnly = true)
    public ScoringProgressResponse getScoringProgress(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        return buildScoringProgress(getRound(roundId));
    }

    @Transactional(readOnly = true)
    @Override
    public AdvancementPreviewResponse previewAdvanceRules(UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        Round round = getRound(roundId);

        List<Ranking> rankings = rankingRepository.findByRoundIdWithSubmissionTeamTrack(roundId);
        List<AdvanceRule> rules = advanceRuleRepository.findByRoundIdOrderByPriorityAscRuleTypeAsc(roundId);
        List<String> warnings = buildAvancementWarnings(round, rankings, rules);
        Map<UUID, AdvanceReason> suggestedReasonsByTeam = new LinkedHashMap<>();
        List<Ranking> suggested = executeAdvanceRules(rankings, rules, suggestedReasonsByTeam);
        Set<UUID> suggestedTeamIds = suggested.stream()
                .map(r -> r.getSubmission().getTeam().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        return new AdvancementPreviewResponse(
                roundId,
                round.getAdvancementConfirmedAt() != null,
                suggested.stream().map(this::toRankingResponse).toList(),
                rankings.stream().map(this::toRankingResponse).toList(),
                rankings.stream()
                        .map(r -> toTeamAdvancementDecisionResponse(
                                r,
                                suggestedTeamIds.contains(r.getSubmission().getTeam().getId()),
                                suggestedTeamIds.contains(r.getSubmission().getTeam().getId()),
                                null,
                                suggestedReasonsByTeam.get(r.getSubmission().getTeam().getId())
                        ))
                        .toList(),
                warnings
        );
    }

    @Transactional
    @Override
    public ConfirmAdvancementResponse confirmAdvancement(UUID roundId, ConfirmAdvancementRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = getRound(roundId);

        if (round.getGradingLockedAt() == null) {
            throw new ConflictException("Grading must be locked before confirming advancement.");
        }
        if (round.getAdvancementConfirmedAt() != null) {
            throw new ConflictException("Advancement has already been confirmed for this round.");
        }

        List<Ranking> rankings = rankingRepository.findByRoundIdWithSubmissionTeamTrack(roundId);
        if (rankings.isEmpty()) {
            throw new ConflictException("No rankings found for this round.");
        }

        List<AdvanceRule> rules = advanceRuleRepository
                .findByRoundIdOrderByPriorityAscRuleTypeAsc(roundId);

        Map<UUID, AdvanceReason> suggestedReasonsByTeam = new LinkedHashMap<>();
        Set<UUID> suggestedTeamIds = executeAdvanceRules(rankings, rules, suggestedReasonsByTeam)
                .stream()
                .map(r -> r.getSubmission().getTeam().getId())
                .collect(Collectors.toCollection(LinkedHashSet::new));

        Set<UUID> finalAdvancedTeamIds = resolveFinalAdvanceTeamId(request, suggestedTeamIds, rankings);
        Map<UUID, String> overrideReasons = validateAndMapOverrideReason(request, rankings);
        validateOverrideCoverage(request, suggestedTeamIds, finalAdvancedTeamIds);
        List<TeamAdvancementDecisionResponse> decisions = new ArrayList<>();

        for (Ranking ranking : rankings) {
            Team team = ranking.getSubmission().getTeam();
            UUID teamId = team.getId();
            boolean suggestedAdvanced = suggestedTeamIds.contains(teamId);
            boolean finalAdvanced = finalAdvancedTeamIds.contains(teamId);
            String overrideReasonForTeam = overrideReasons.get(teamId);

            if (finalAdvanced) {
                ranking.markAdvanced(suggestedAdvanced
                        ? suggestedReasonsByTeam.get(teamId)
                        : AdvanceReason.MANUAL_ADVANCE);
                if (team.getStatus() != TeamStatus.WINNER) {
                    team.setStatus(TeamStatus.ADVANCED);
                }
            } else {
                ranking.markNotAdvanced(AdvanceReason.NOT_ADVANCED);
                if (team.getStatus() != TeamStatus.WINNER) {
                    team.setStatus(TeamStatus.ELIMINATED);
                }
            }
            decisions.add(toTeamAdvancementDecisionResponse(
                    ranking,
                    suggestedAdvanced,
                    finalAdvanced,
                    overrideReasonForTeam,
                    ranking.getAdvanceReason()
            ));
        }

        LocalDateTime confirmedAt = LocalDateTime.now();
        round.setAdvancementConfirmedAt(confirmedAt);

        rankingRepository.saveAll(rankings);
        teamRepository.saveAll(rankings.stream()
                .map(r -> r.getSubmission().getTeam()).toList());
        roundRepository.save(round);

        auditLogRepository.save(AuditLog.builder()
                .actor(actor)
                .actionType(AuditActionType.ADVANCEMENT_CONFIRMED)
                .targetTable("rounds")
                .targetId(round.getId())
                .beforeState(null)
                .afterState(Map.of(
                        "advancedTeamIds", finalAdvancedTeamIds.stream()
                                .map(UUID::toString)
                                .toList(),
                        "eliminatedTeamIds", rankings.stream()
                                .map(r -> r.getSubmission().getTeam().getId())
                                .filter(id -> !finalAdvancedTeamIds.contains(id))
                                .map(UUID::toString)
                                .toList(),
                        "overrideReasons", overrideReasons
                ))
                .context(Map.of(
                        "eventId", round.getEvent().getId().toString(),
                        "note", request == null || request.note() == null ? "" : request.note()
                ))
                .build());

        notifyAdvancementTypeId(actor, round, decisions);

        int advancedCount = finalAdvancedTeamIds.size();
        int eliminatedCount = rankings.size() - advancedCount;

        return new ConfirmAdvancementResponse(
                roundId,
                advancedCount,
                eliminatedCount,
                confirmedAt,
                decisions,
                buildAvancementWarnings(round, rankings, rules)
        );
    }

    //HELPERS

    private void notifyAdvancementTypeId(
            User user,
            Round round,
            List<TeamAdvancementDecisionResponse> decisions
    ) {
        for (TeamAdvancementDecisionResponse decision : decisions) {
            try {
                boolean advanced = Boolean.TRUE.equals(decision.finalAdvanced());
                notificationService.createSystemNotification(
                        user,
                        round.getEvent(),
                        advanced ? NotificationType.TEAM_ADVANCED : NotificationType.TEAM_ELIMINATED,
                        advanced ? "Your team advanced" : "Your team eliminated",
                        advanced
                                ? "Team " + decision.teamName() + " advanced after round " + round.getName() + "."
                                : "Team " + decision.teamName() + " did not advance after round " + round.getName() + ".",
                        NotificationTargetScope.TEAM,
                        decision.teamId(),
                        null,
                        NotificationChannel.BOTH,
                        null
                );
            } catch (RuntimeException ex) {
                log.warn(
                        "Failed to create advancement notification. roundId={}, teamId={}",
                        round.getId(),
                        decision.teamId(),
                        ex
                );
            }
        }
    }

    private Map<UUID, String> validateAndMapOverrideReason(
            ConfirmAdvancementRequest request,
            List<Ranking> rankings
    ) {
        if (request == null || request.overrides() == null || request.overrides().isEmpty()) {
            return Map.of();
        }

        Set<UUID> validTeamIds = rankings.stream()
                .map(r -> r.getSubmission().getTeam().getId())
                .collect(Collectors.toSet());

        Map<UUID, String> reasons = new LinkedHashMap<>();
        for (AdvancementOverrideRequest override : request.overrides()) {
            if (override == null || override.teamId() == null || override.advanced() == null) {
                throw new BadRequestException("Override team ID and advanced flag are required");
            }
            if (!validTeamIds.contains(override.teamId())) {
                throw new BadRequestException("Override team does not belong to this round ranking: " + override.teamId());
            }
            String reason = trimToNull(override.reason());
            if (reason == null) {
                throw new BadRequestException("Override reason is required for team: " + override.teamId());
            }
            if (reasons.containsKey(override.teamId())) {
                throw new BadRequestException("Duplicate override for team: " + override.teamId());
            }
            reasons.put(override.teamId(), reason);
        }

        return reasons;
    }

    private Set<UUID> resolveFinalAdvanceTeamId(
            ConfirmAdvancementRequest request,
            Set<UUID> suggestedTeamIds,
            List<Ranking> rankings
    ) {
        Set<UUID> validTeamIds = rankings.stream()
                .map(r -> r.getSubmission().getTeam().getId())
                .collect(Collectors.toSet());

        Set<UUID> finalAdvancedTeamIds;
        if (request != null && request.advancedTeamIds() != null && !request.advancedTeamIds().isEmpty()) {
            finalAdvancedTeamIds = new LinkedHashSet<>(request.advancedTeamIds());
        } else {
            finalAdvancedTeamIds = new LinkedHashSet<>(suggestedTeamIds);
        }

        if (!validTeamIds.containsAll(finalAdvancedTeamIds)) {
            throw new BadRequestException("Advanced team list contains team that do not belong to this round ranking.");
        }

        if (request != null && request.overrides() != null) {
            for (AdvancementOverrideRequest override : request.overrides()) {
                if (override == null || override.teamId() == null || override.advanced() == null) {
                    throw new BadRequestException("Override team ID and advanced flag are required");
                }
                if (!validTeamIds.contains(override.teamId())) {
                    throw new BadRequestException("Override team does not belong to this round ranking: " + override.teamId());
                }

                if (Boolean.TRUE.equals(override.advanced())) {
                    finalAdvancedTeamIds.add(override.teamId());
                } else {
                    finalAdvancedTeamIds.remove(override.teamId());
                }
            }
        }
        return finalAdvancedTeamIds;
    }

    private void validateOverrideCoverage(
            ConfirmAdvancementRequest request,
            Set<UUID> suggestedTeamIds,
            Set<UUID> finalAdvancedTeamIds
    ) {
        Set<UUID> changedTeamIds = new LinkedHashSet<>(suggestedTeamIds);
        changedTeamIds.addAll(finalAdvancedTeamIds);
        changedTeamIds.removeIf(teamId -> suggestedTeamIds.contains(teamId)
                == finalAdvancedTeamIds.contains(teamId));

        if (changedTeamIds.isEmpty()) {
            return;
        }

        Map<UUID, AdvancementOverrideRequest> overridesByTeam = new LinkedHashMap<>();
        if (request != null && request.overrides() != null) {
            for (AdvancementOverrideRequest override : request.overrides()) {
                if (override != null && override.teamId() != null) {
                    overridesByTeam.put(override.teamId(), override);
                }
            }
        }

        for (UUID teamId : changedTeamIds) {
            AdvancementOverrideRequest override = overridesByTeam.get(teamId);
            if (override == null) {
                throw new BadRequestException("Override reason is required for changed team: " + teamId);
            }

            boolean finalAdvanced = finalAdvancedTeamIds.contains(teamId);
            if (!Boolean.valueOf(finalAdvanced).equals(override.advanced())) {
                throw new BadRequestException(
                        "Override advanced flag does not match final decision for team: " + teamId);
            }
        }
    }

    private TeamAdvancementDecisionResponse toTeamAdvancementDecisionResponse(
            Ranking ranking,
            boolean suggestedAdvanced,
            boolean finalAdvanced,
            String overrideReason,
            AdvanceReason advanceReason
    ) {
        Team team = ranking.getSubmission().getTeam();
        Track track = ranking.getTrack();

        return new TeamAdvancementDecisionResponse(
                team.getId(),
                team.getName(),
                track == null ? null : track.getId(),
                track == null ? null : track.getName(),
                ranking.getRankPosition(),
                ranking.getTotalScore(),
                suggestedAdvanced,
                finalAdvanced,
                team.getStatus() == null ? null : team.getStatus().name(),
                advanceReason == null ? null : advanceReason.name(),
                overrideReason
        );
    }

    private List<String> buildAvancementWarnings(
            Round round,
            List<Ranking> rankings,
            List<AdvanceRule> rules
    ) {
        List<String> warnings = new ArrayList<>();

        if (rankings.isEmpty()) {
            warnings.add("No ranking rows found for this round. Calculate rankings before previewing advancement.");
        }
        if (rules.isEmpty()) {
            warnings.add("No advance rules configured for this round.");
        }
        if (round.getGradingLockedAt() == null) {
            warnings.add("Grading is not locked yet. Preview may change after judges finish scoring.");
        }

        return warnings;
    }

    private void assertTrackRoundEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();

        if (status != RegistrationStatus.DRAFT && status != RegistrationStatus.REGISTRATION) {
            throw new ConflictException("Rounds are locked in event status " + status + ".");
        }
    }

    private void validateCreateRoundRequest(CreateRoundRequest request) {
        if (trimToNull(request.name()) == null) {
            throw new BadRequestException("Round name is required");
        }

        if (request.orderIndex() == null || request.orderIndex() < 0) {
            throw new BadRequestException("Round orderIndex must not be negative");
        }

        validateDeadlines(request.submissionDeadline(), request.judgingDeadline());
    }

    private void validateDeadlines(LocalDateTime submissionDeadline, LocalDateTime judgingDeadline) {
        if (judgingDeadline != null && submissionDeadline != null &&
                judgingDeadline.isBefore(submissionDeadline)) {
            throw new BadRequestException("judgingDeadline cannot be before submissionDeadline");
        }
    }

    private <E extends Enum<E>> E parseEnum(Class<E> enumClass, String value, String fieldName) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(fieldName + " is required.");
        }
        try {
            return Enum.valueOf(enumClass, value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
    }

    private String trimToNull(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return value.trim();
    }

    private RoundResponse toRoundResponse(Round round) {
        return new RoundResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getName(),
                round.getDescription(),
                round.getOrderIndex(),
                round.getIsFinal(),
                round.getStatus().name(),
                round.getSubmissionDeadline(),
                round.getJudgingDeadline()
        );
    }

    private void ensureRoundExist(UUID roundId) {
        if (!roundRepository.existsById(roundId)) {
            throw new NotFoundException("Round not found " + roundId);
        }
    }

    private AdvanceRuleResponse toAdvanceRuleResponse(AdvanceRule advanceRule) {
        Integer topN = null;
        Double topPercent = null;
        Double minScore = null;
        Integer wildCardSlots = null;

        if (advanceRule.getValue() != null) {
            switch (advanceRule.getRuleType()) {
                case TOP_N -> topN = Math.round(advanceRule.getValue());
                case TOP_PERCENT -> topPercent = advanceRule.getValue().doubleValue();
                case MIN_SCORE -> minScore = advanceRule.getValue().doubleValue();
                case WILDCARD -> wildCardSlots = Math.round(advanceRule.getValue());
            }
        }

        return new AdvanceRuleResponse(
                advanceRule.getId(),
                advanceRule.getRound().getId(),
                advanceRule.getTrack() == null ? null : advanceRule.getTrack().getId(),
                advanceRule.getRuleType().name(),
                topN,
                minScore,
                topPercent,
                wildCardSlots,
                Boolean.TRUE,
                advanceRule.getValue(),
                advanceRule.getPriority(),
                advanceRule.getDescription()
        );
    }

    private Round getRound(UUID roundId) {
        return roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));
    }

    private void assertAdvanceRuleEditable(Round round) {
        RegistrationStatus status = round.getEvent().getStatus();

        if (status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED) {
            throw new ConflictException("Advance rules cannot be edited in this status " + status + ".");
        }

        if (round.getGradingLockedAt() != null) {
            throw new ConflictException("Advance rules cannot be edited after grading is locked.");
        }

        if (round.getAdvancementConfirmedAt() != null) {
            throw new ConflictException("Advance rules cannot be edited after advancement has been confirmed.");
        }
    }

    private Track resolveOptionalTrack(UUID trackId, Round round) {
        if (trackId == null) {
            return null;
        }

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found " + trackId));

        if (!track.getEvent().getId().equals(round.getEvent().getId())) {
            throw new BadRequestException("Track does not belong to this round's event.");
        }

        return track;
    }

    private Track resolveNextTrack(Round round, UpdateAdvanceRuleRequest request, Track currentTrack) {
        if (Boolean.TRUE.equals(request.global())) {
            return null;
        }

        if (request.trackId() != null) {
            return resolveOptionalTrack(request.trackId(), round);
        }

        return currentTrack;
    }

    private void assertNoDuplicateAdvanceRuleOnUpdate(
            UUID roundId, RuleType ruleType,
            UUID trackId, UUID currentRuleId
    ) {
        boolean exists = advanceRuleRepository.findByRoundIdOrderByPriorityAscRuleTypeAsc(roundId)
                .stream()
                .filter(r -> !r.getId().equals(currentRuleId))
                .anyMatch(r -> {
                    UUID existingTrackId = r.getTrack() == null ? null : r.getTrack().getId();
                    return r.getRuleType() == ruleType
                            && ((existingTrackId == null && trackId == null)
                            || (existingTrackId != null && existingTrackId.equals(trackId)));
                });

        if (exists) {
            throw new ConflictException("Advance rule already exists for this round and track.");
        }
    }

    private void assertNoDuplicateAdvanceRule(
            UUID roundId, RuleType ruleType, UUID trackId
    ) {
        boolean exists = (trackId == null)
                ? advanceRuleRepository.existGlobalRule(roundId, ruleType)
                : advanceRuleRepository.existsByRoundIdAndRuleTypeAndTrackId(roundId, ruleType, trackId);
        if (exists) {
            throw new ConflictException("Advance rule already exists for this round and track.");
        }
    }

    private Float resolveRuleValue(
            RuleType ruleType, Integer topN,
            Double topPercent, Double minScore,
            Integer wildCardSlots
    ) {
        return switch (ruleType) {
            case TOP_N -> {
                if (topN == null || topN <= 0) {
                    throw new BadRequestException("topN must be greater than 0 for TOP_N rule type.");
                }
                yield topN.floatValue();
            }

            case TOP_PERCENT -> {
                if (topPercent == null || topPercent <= 0 || topPercent > 100) {
                    throw new BadRequestException("topPercent must be greater than 0 and less than or equal to 100 for TOP_PERCENT rule type.");
                }
                yield topPercent.floatValue();
            }

            case MIN_SCORE -> {
                if (minScore == null || minScore <= 0) {
                    throw new BadRequestException("minScore must be greater than 0 for MIN_SCORE rule type.");
                }
                yield minScore.floatValue();
            }

            case WILDCARD -> {
                if (wildCardSlots == null || wildCardSlots <= 0) {
                    throw new BadRequestException("wildCardSlots must be greater than 0 for WILDCARD rule type.");
                }
                yield wildCardSlots.floatValue();
            }
        };
    }

    private int resolvePriority(Integer reqPriority, RuleType ruleType) {
        if (reqPriority == null) {
            return priorityFor(ruleType);
        }

        if (reqPriority <= 0) {
            throw new BadRequestException("Priority must be greater than 0");
        }

        return reqPriority;
    }

    private int priorityFor(RuleType ruleType) {
        return switch (ruleType) {
            case TOP_N, TOP_PERCENT -> 2;
            case MIN_SCORE -> 1;
            case WILDCARD -> 3;
        };
    }

    private AdvanceRule getAdvanceRule(UUID advanceRuleId) {
        return advanceRuleRepository.findById(advanceRuleId)
                .orElseThrow(() -> new NotFoundException("Advance rule not found " + advanceRuleId));
    }

    private boolean hasRuleValuePatch(UpdateAdvanceRuleRequest request) {
        return request.topN() != null
                || request.topPercent() != null
                || request.minScore() != null
                || request.wildCardSlots() != null;
    }

    private void saveRoundAudit(
            User user,
            Round round,
            AuditActionType actionType,
            String beforeStatus,
            String afterStatus
    ) {
        try {
            AuditLog log = new AuditLog();

            log.setActor(user);
            log.setActionType(actionType);
            log.setTargetTable("rounds");
            log.setTargetId(round.getId());
            log.setBeforeState(Map.of(
                    "status", beforeStatus
            ));
            log.setAfterState(Map.of(
                    "status", afterStatus,
                    "submissionLockedAt", round.getSubmissionLockedAt() == null
                            ? "" : round.getSubmissionLockedAt().toString()
            ));
            log.setContext(Map.of(
                    "eventId", round.getEvent().getId().toString()
            ));

            auditLogRepository.save(log);
        } catch (RuntimeException ex) {
            log.warn(
                    "Failed to save round audit. roundId={}, actionType={}",
                    round.getId(),
                    actionType,
                    ex
            );
        }
    }

    private ScoringProgressResponse buildScoringProgress(Round round) {
        List<RoundJudgeAssignment> assignments = roundJudgeAssignmentRepository.findByRoundIdWithJudgeAndTrack(round.getId());
        List<JudgeProgressResponse> judgeProgress = new ArrayList<>();

        int completedTotal = 0;
        int assignedTotal = 0;

        for (RoundJudgeAssignment assignment : assignments) {
            UUID trackId = assignment.getTrack() == null ? null : assignment.getTrack().getId();
            List<Submission> submissions = submissionRepository.findSubmittedOrLateByRoundAndTrackNullable(round.getId(), trackId);
            int total = submissions.size();
            int completed = 0;

            for (Submission submission : submissions) {
                long criteriaCount = countCriteriaForRound(submission.getRound());
                long confirmed = scoreRepository.countBySubmissionIdAndJudgeIdAndIsDraftFalse(
                        submission.getId(), assignment.getJudge().getId());
                if (criteriaCount > 0 && confirmed >= criteriaCount) {
                    completed++;
                }
            }

            assignment.setTotalToScore(total);
            assignment.setScoringProgress(completed);
            judgeProgress.add(new JudgeProgressResponse(
                    assignment.getJudge().getId(),
                    assignment.getJudge().getUser().getFullName(),
                    trackId,
                    completed,
                    total
            ));

            completedTotal += completed;
            assignedTotal += total;
        }

        double percent = assignedTotal == 0 ? 0.0 : completedTotal * 100.0 / assignedTotal;
        return new ScoringProgressResponse(round.getId(), completedTotal, assignedTotal, percent, judgeProgress);
    }

    private long countCriteriaForRound(Round round) {
        if (round == null || round.getEvent() == null) {
            return 0;
        }
        return round.getEvent().getEventCriteria().stream()
                .filter(EventCriteria::isActiveCriteria)
                .filter(criteria -> criteria.appliesToRound(round.getId()))
                .count();
    }

    private List<Ranking> executeAdvanceRules(List<Ranking> rankings, List<AdvanceRule> rules) {
        return executeAdvanceRules(rankings, rules, null);
    }

    private List<Ranking> executeAdvanceRules(
            List<Ranking> rankings,
            List<AdvanceRule> rules,
            Map<UUID, AdvanceReason> reasonsByTeam
    ) {
        if (rankings == null || rankings.isEmpty() || rules == null || rules.isEmpty()) {
            return List.of();
        }

        List<Ranking> sorted = rankings.stream()
                .filter(ranking -> ranking.getAdvanceReason() != AdvanceReason.DISQUALIFIED)
                .filter(ranking -> ranking.getSubmission() == null
                        || ranking.getSubmission().getStatus() != SubmissionStatus.DISQUALIFIED)
                .sorted(Comparator
                        .comparing((Ranking r) -> r.getTrack().getId().toString())
                        .thenComparing(Ranking::getRankPosition)
                        .thenComparing(Ranking::getTotalScore, Comparator.reverseOrder()))
                .toList();

        LinkedHashSet<Ranking> selected = new LinkedHashSet<>();

        for (AdvanceRule rule : rules) {
            Map<UUID, List<Ranking>> scopedByTrack = sorted.stream()
                    .filter(r -> rule.appliesToTrack(r.getTrack().getId()))
                    .collect(Collectors.groupingBy(
                            r -> r.getTrack().getId(),
                            LinkedHashMap::new,
                            Collectors.toList()
                    ));

            for (List<Ranking> scoped : scopedByTrack.values()) {
                switch (rule.getRuleType()) {
                    case TOP_N -> addSelected(
                            selected,
                            scoped.stream()
                                    .limit(Math.max(0, Math.round(rule.getValue())))
                                    .toList(),
                            AdvanceReason.TOP_N,
                            reasonsByTeam
                    );
                    case TOP_PERCENT -> {
                        int limit = (int) Math.ceil(scoped.size() * (rule.getValue() / 100.0));
                        addSelected(
                                selected,
                                scoped.stream().limit(Math.max(0, limit)).toList(),
                                AdvanceReason.TOP_PERCENT,
                                reasonsByTeam
                        );
                    }
                    case MIN_SCORE -> addSelected(
                            selected,
                            scoped.stream()
                                    .filter(r -> r.getTotalScore() != null
                                            && r.getTotalScore() >= rule.getValue())
                                    .toList(),
                            AdvanceReason.MIN_SCORE,
                            reasonsByTeam
                    );
                    case WILDCARD -> addSelected(
                            selected,
                            scoped.stream()
                                    .filter(r -> !selected.contains(r))
                                    .sorted(Comparator
                                            .comparing(Ranking::getTotalScore,
                                                    Comparator.nullsLast(Comparator.reverseOrder()))
                                            .thenComparing(Ranking::getRankPosition))
                                    .limit(Math.max(0, Math.round(rule.getValue())))
                                    .toList(),
                            AdvanceReason.WILDCARD,
                            reasonsByTeam
                    );
                }
            }
        }

        return new ArrayList<>(selected);
    }

    private void addSelected(
            Set<Ranking> selected,
            List<Ranking> candidates,
            AdvanceReason reason,
            Map<UUID, AdvanceReason> reasonsByTeam
    ) {
        for (Ranking ranking : candidates) {
            if (selected.add(ranking) && reasonsByTeam != null) {
                reasonsByTeam.put(ranking.getSubmission().getTeam().getId(), reason);
            }
        }
    }

    private RankingResponse toRankingResponse(Ranking ranking) {
        Submission submission = ranking.getSubmission();
        Team team = submission.getTeam();
        Round round = ranking.getRound();
        HackathonEvent event = round.getEvent();
        Track track = ranking.getTrack();

        return new RankingResponse(
                ranking.getId(),
                event.getId(),
                event.getName(),
                submission.getId(),
                team.getId(),
                team.getName(),
                team.getProjectTitle(),
                round.getId(),
                round.getName(),
                track.getId(),
                track.getName(),
                ranking.getTotalScore(),
                ranking.getRankPosition(),
                ranking.getIsAdvanced(),
                ranking.getJudgeCount(),
                ranking.getScoreBreakdown(),
                ranking.getCalculatedAt(),
                event.getResultPublishedAt() != null,
                ranking.getAdvanceReason() == null ? null : ranking.getAdvanceReason().name(),
                submission.getStatus() == null ? null : submission.getStatus().name(),
                team.getStatus() == null ? null : team.getStatus().name()
        );
    }

    private void saveRoundNotification(
            User user,
            Round round,
            NotificationType type,
            String title,
            String body
    ) {
        try {
            NotificationTargetScope scope = type == NotificationType.JUDGING_READY
                    ? NotificationTargetScope.ROUND_JUDGES
                    : NotificationTargetScope.EVENT_PARTICIPANTS;
            UUID targetId = type == NotificationType.JUDGING_READY ? round.getId() : null;

            notificationService.createSystemNotification(
                    user,
                    round.getEvent(),
                    type,
                    title,
                    body,
                    scope,
                    targetId,
                    null,
                    NotificationChannel.BOTH,
                    null
            );
        } catch (RuntimeException ex) {
            log.warn(
                    "Failed to create round notification. roundId={}, notificationType={}",
                    round.getId(),
                    type,
                    ex
            );
        }
    }

    private RoundOperationStatusResponse toRoundOperationStatus(Round round) {

        long submittedOrLate = submissionRepository
                .countSubmittedOrLateByRoundAndTrackNullable(round.getId(), null);

        long drafts = submissionRepository.findDraftsByRoundId(round.getId()).size();
        long assignmentCount = roundJudgeAssignmentRepository.findByRoundIdWithJudgeAndTrack(round.getId()).size();

        return new RoundOperationStatusResponse(
                round.getId(),
                round.getEvent().getId(),
                round.getEvent().getStatus().name(),
                round.getStatus().name(),
                round.getSubmissionDeadline(),
                round.getJudgingDeadline(),
                round.getSubmissionLockedAt(),
                round.getGradingLockedAt(),
                round.getEvent().getStatus() == RegistrationStatus.ONGOING
                        && (round.getStatus() == RoundStatus.UPCOMING || round.getStatus() == RoundStatus.CLOSED)
                        && round.getSubmissionLockedAt() == null,
                round.getStatus() == RoundStatus.OPEN,
                (round.getStatus() == RoundStatus.OPEN || round.getStatus() == RoundStatus.CLOSED)
                        && round.getSubmissionLockedAt() == null,
                submittedOrLate,
                drafts,
                assignmentCount
        );
    }
}
