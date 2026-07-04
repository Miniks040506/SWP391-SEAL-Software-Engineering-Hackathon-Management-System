package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.dto.RankingDraft;
import com.t7.seal.entities.*;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;
import com.t7.seal.response.submission.TeamDetailedScoreResponse;
import com.t7.seal.response.submission.TeamScoreCriterionResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RankingRepository rankingRepository;
    private final HackathonEventRepository eventRepository;
    private final EventAnnouncementRepository eventAnnouncementRepository;
    private final RoundRepository roundRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final ScoreRepository scoreRepository;
    private final EventCriteriaRepository eventCriteriaRepository;
    private final SubmissionRepository submissionRepository;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional(readOnly = true)
    @Override
    public List<RankingResponse> getRankings(UUID eventId, UUID trackId, UUID roundId) {
        return rankingRepository.getPublicRankings(eventId, trackId, roundId)
                .stream()
                .map(this::toPublicRankingResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<RankingResponse> getCoordinatorRankings(UUID eventId, UUID trackId, UUID roundId, Authentication authentication) {
        currentUserService.getCurrentUser(authentication);
        return rankingRepository.getCoordinatorRankings(eventId, trackId, roundId)
                .stream()
                .map(this::toRankingResponse)
                .toList();
    }

    @Transactional
    @Override
    public RankingRecalculationResponse calculateRoundRankings(
            UUID roundId,
            UUID trackId,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));

        if (round.getGradingLockedAt() == null) {
            throw new ConflictException("Grading must be locked before calculating rankings.");
        }

        List<EventCriteria> activeCriteria = eventCriteriaRepository
                .findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(round.getEvent().getId())
                .stream()
                .filter(criteria -> criteria.appliesToRound(round.getId()))
                .toList();

        if (activeCriteria.isEmpty()) {
            throw new ConflictException("No active scoring criteria are configured for this round.");
        }

        Set<UUID> activeCriteriaIds = activeCriteria.stream()
                .map(EventCriteria::getId)
                .collect(Collectors.toSet());

        Map<UUID, Submission> rankableSubmissions = submissionRepository
                .findRankableByRoundAndTrackNullable(roundId, trackId)
                .stream()
                .filter(submission -> submission.getTeam() != null
                        && submission.getTeam().getTrack() != null)
                .collect(Collectors.toMap(
                        Submission::getId,
                        Function.identity(),
                        (a, b) -> a,
                        LinkedHashMap::new)
                );

        List<Score> confirmedScores = scoreRepository.findConfirmedByRoundId(roundId)
                .stream()
                .filter(score -> rankableSubmissions
                        .containsKey(score.getSubmission().getId()))
                .filter(score -> score.getEventCriteria() != null
                        && activeCriteriaIds.contains(score.getEventCriteria().getId()))
                .toList();

        Map<UUID, List<Score>> scoresBySubmission = confirmedScores.stream()
                .collect(Collectors.groupingBy(
                        score -> score.getSubmission().getId(),
                        LinkedHashMap::new,
                        Collectors.toList())
                );

        List<RankingDraft> rankingDrafts = new ArrayList<>();
        for (Submission submission : rankableSubmissions.values()) {
            List<Score> submissionScores = scoresBySubmission
                    .getOrDefault(submission.getId(), List.of());

            Optional<RankingDraft> draft = isDisqualifiedSubmission(submission)
                    ? Optional.of(buildDisqualifiedRankingDraft(submission, submissionScores, activeCriteriaIds))
                    : buildRankingDraft(submission, submissionScores, activeCriteriaIds);

            draft.ifPresent(rankingDrafts::add);
        }

        rankingRepository.deleteByRoundIdAndTrackIdNullable(roundId, trackId);
        rankingRepository.flush();

        LocalDateTime calculatedAt = LocalDateTime.now();
        List<Ranking> rankings = new ArrayList<>();

        Map<UUID, List<RankingDraft>> draftsByTrack = rankingDrafts.stream()
                .collect(Collectors.groupingBy(
                        draft -> draft.track().getId(),
                        LinkedHashMap::new,
                        Collectors.toList())
                );

        for (List<RankingDraft> trackDrafts : draftsByTrack.values()) {
            List<RankingDraft> sorted = sortRankingDraftsWithDisqualifiedLast(trackDrafts);
            List<Ranking> trackRankings = new ArrayList<>();

            int rank = 1;
            for (RankingDraft draft : sorted) {
                Ranking ranking = Ranking.builder()
                        .submission(draft.submission())
                        .round(round)
                        .track(draft.track())
                        .totalScore(draft.totalScore())
                        .scoreBreakdown(draft.scoreBreakdown())
                        .judgeCount(draft.judgeCount())
                        .rankPosition(rank++)
                        .isAdvanced(false)
                        .calculatedAt(calculatedAt)
                        .calculatedBy(actor)
                        .build();
                if (isDisqualifiedSubmission(draft.submission())) {
                    ranking.markDisqualified();
                }
                trackRankings.add(ranking);
            }
            applyTieFlags(trackRankings);
            rankings.addAll(trackRankings);
        }

        rankingRepository.saveAll(rankings);

        auditLogService.record(
                actor,
                AuditActionType.RANKING_RECALCULATED,
                "rounds",
                round.getId(),
                null,
                Map.of(
                        "roundId", round.getId().toString(),
                        "trackId", trackId == null ? "ALL" : trackId.toString(),
                        "rankingCount", rankings.size()
                ),
                Map.of(
                        "eventId", round.getEvent().getId().toString(),
                        "calculatedAt", calculatedAt.toString()
                )
        );

        return new RankingRecalculationResponse(
                roundId,
                trackId,
                rankings.size(),
                calculatedAt
        );
    }

    @Override
    @Transactional
    public PublishResultsResponse publishEventResults(
            UUID eventId,
            PublishResultsRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        HackathonEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        if (event.getResultPublishedAt() != null) {
            List<Ranking> publishedRankings =
                    rankingRepository.findByEventRoundTrackWithDetails(event.getId(), null, null);
            return new PublishResultsResponse(
                    event.getId(),
                    null,
                    event.getResultPublishedAt(),
                    null,
                    0,
                    false,
                    false,
                    publishedRankings.size()
            );
        }

        ensureEventCanPublish(event);

        List<Round> eventRounds = roundRepository.findByEventIdOrderByOrderIndexAsc(eventId);
        if (eventRounds.isEmpty()) {
            throw new ConflictException("Cannot publish event results without a configured round.");
        }

        Round finalRound = eventRounds.get(eventRounds.size() - 1);
        if (finalRound.getGradingLockedAt() == null) {
            throw new ConflictException(
                    "Final round grading must be locked before publishing event results.");
        }

        List<Ranking> rankings = rankingRepository.findByEventRoundTrackWithDetails(eventId, null, null);
        if (rankings.isEmpty()) {
            throw new ConflictException("Cannot publish results before rankings are calculated.");
        }
        List<Ranking> finalRoundRankings = rankings.stream()
                .filter(ranking -> ranking.getRound().getId().equals(finalRound.getId()))
                .toList();
        if (finalRoundRankings.isEmpty()) {
            throw new ConflictException(
                    "Final round rankings must be calculated before publishing event results.");
        }
        ensureNoManualTieResolutionRequired(finalRoundRankings, "event");

        LocalDateTime now = LocalDateTime.now();
        event.publishResults(now);
        eventRepository.save(event);

        UUID announcementId = createResultAnnouncement(event, null, actor, request, now);
        PublicationFanout fanout = sendResultNotifications(event, null, rankings, actor, request);

        auditLogService.record(
                actor,
                AuditActionType.RESULT_PUBLISHED,
                "hackathon_events",
                event.getId(),
                null,
                Map.of(
                        "eventId", event.getId().toString(),
                        "publishedAt", now.toString(),
                        "rankingCount", rankings.size(),
                        "notificationSent", fanout.notificationSent(),
                        "emailQueued", fanout.emailQueued(),
                        "scope", "EVENT"
                ),
                null
        );

        return new PublishResultsResponse(
                event.getId(),
                null,
                now,
                announcementId,
                fanout.notifiedCount(),
                fanout.notificationSent(),
                fanout.emailQueued(),
                rankings.size()
        );
    }

    @Transactional
    @Override
    public PublishResultsResponse publishRoundResults(
            UUID roundId,
            PublishResultsRequest request,
            Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found " + roundId));

        if (round.getResultPublishedAt() != null) {
            List<Ranking> publishedRankings =
                    rankingRepository.findByRoundIdAndTrackIdWithDetails(round.getId(), null);
            return new PublishResultsResponse(
                    round.getEvent().getId(),
                    round.getId(),
                    round.getResultPublishedAt(),
                    null,
                    0,
                    false,
                    false,
                    publishedRankings.size()
            );
        }

        if (round.getGradingLockedAt() == null) {
            throw new ConflictException("Grading must be locked before publishing round results.");
        }

        List<Ranking> rankings = rankingRepository.findByRoundIdAndTrackIdWithDetails(roundId, null);
        if (rankings.isEmpty()) {
            throw new ConflictException("Cannot publish round results before rankings are calculated.");
        }
        ensureNoManualTieResolutionRequired(rankings, "round");

        LocalDateTime now = LocalDateTime.now();
        round.publishResults(now);
        roundRepository.save(round);

        UUID announcementId = createResultAnnouncement(round.getEvent(), round, actor, request, now);
        PublicationFanout fanout = sendResultNotifications(round.getEvent(), round, rankings, actor, request);

        auditLogService.record(
                actor,
                AuditActionType.RESULT_PUBLISHED,
                "rounds",
                round.getId(),
                null,
                Map.of(
                        "eventId", round.getEvent().getId().toString(),
                        "roundId", round.getId().toString(),
                        "publishedAt", now.toString(),
                        "rankingCount", rankings.size(),
                        "notificationSent", fanout.notificationSent(),
                        "emailQueued", fanout.emailQueued(),
                        "scope", "ROUND"
                ),
                null
        );

        return new PublishResultsResponse(
                round.getEvent().getId(),
                round.getId(),
                now,
                announcementId,
                fanout.notifiedCount(),
                fanout.notificationSent(),
                fanout.emailQueued(),
                rankings.size()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamDetailedScoreResponse> getPublishedTeamScores(
            UUID teamId, Authentication authentication) {
        User viewer = currentUserService.getCurrentUser(authentication);
        ensureCanViewTeamScores(teamId, viewer);

        return rankingRepository.findPublishedByTeamIdWithDetails(teamId)
                .stream()
                .map(this::toTeamDetailedScoreResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public TeamDetailedScoreResponse getPublishedTeamRoundScore(
            UUID teamId,
            UUID roundId,
            Authentication authentication
    ) {
        User viewer = currentUserService.getCurrentUser(authentication);
        ensureCanViewTeamScores(teamId, viewer);

        Ranking ranking = rankingRepository.findPublishedByRoundIdAndTeamIdWithDetails(roundId, teamId)
                .orElseThrow(() -> new NotFoundException("Published team score was not found for this round."));

        return toTeamDetailedScoreResponse(ranking);
    }

    @Override
    @Transactional(readOnly = true)
    public TeamDetailedScoreResponse getPublishedSubmissionScore(
            UUID submissionId,
            Authentication authentication
    ) {
        User viewer = currentUserService.getCurrentUser(authentication);

        Ranking ranking = rankingRepository.findPublishedBySubmissionIdWithDetails(submissionId)
                .orElseThrow(() -> new NotFoundException("Published score was not found for this submission."));

        ensureCanViewTeamScores(ranking.getSubmission().getTeam().getId(), viewer);

        return toTeamDetailedScoreResponse(ranking);
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamRankingHistoryResponse> getTeamRankingHistory(UUID teamId) {
        return rankingRepository.findPublicTeamHistory(teamId)
                .stream()
                .map(this::toTeamRankingHistoryResponse)
                .toList();
    }

    //HELPERS

    private void ensureEventCanPublish(HackathonEvent event) {
        if (event.getStatus() != RegistrationStatus.JUDGING
                && event.getStatus() != RegistrationStatus.COMPLETED) {
            throw new ConflictException("Results can only be published when event is JUDGING or COMPLETED.");
        }
    }

    private void ensureNoManualTieResolutionRequired(List<Ranking> rankings, String scope) {
        long unresolvedTieCount = rankings.stream()
                .filter(ranking -> Boolean.TRUE.equals(ranking.getManualResolutionRequired()))
                .count();
        if (unresolvedTieCount > 0) {
            throw new ConflictException(
                    "Cannot publish " + scope + " results while "
                            + unresolvedTieCount
                            + " tied ranking row(s) require manual resolution."
            );
        }
    }

    private void ensureCanViewTeamScores(UUID teamId, User viewer) {
        if (viewer == null) {
            throw new UnauthorizedException("Authentication is required.");
        }
        if (viewer.isAdmin() || viewer.isCoordinator()) {
            return;
        }
        if (viewer.isStudent() && teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(teamId, viewer.getId())) {
            return;
        }
        throw new ForbiddenException("You can only view your own team's published scores.");
    }

    private UUID createResultAnnouncement(HackathonEvent event,
                                          Round round,
                                          User actor,
                                          PublishResultsRequest request,
                                          LocalDateTime publishedAt) {
        if (request != null && Boolean.FALSE.equals(request.createAnnouncement())) {
            return null;
        }

        String title = resolveAnnouncementTitle(event, round, request);
        String content = resolveAnnouncementBody(event, round, request);

        EventAnnouncement announcement = EventAnnouncement.builder()
                .event(event)
                .title(title)
                .content(content)
                .isPinned(true)
                .isResultAnnouncement(true)
                .sendEmail(resultSendEmail(request))
                .sendInApp(resultSendInApp(request))
                .targetScope(NotificationTargetScope.ALL_EVENT_USERS)
                .createdBy(actor)
                .build();
        announcement.publish(publishedAt);
        EventAnnouncement saved = eventAnnouncementRepository.save(announcement);

        auditLogService.record(
                actor,
                AuditActionType.ANNOUNCEMENT_PUBLISHED,
                "event_announcements",
                saved.getId(),
                null,
                Map.of(
                        "eventId", event.getId().toString(),
                        "roundId", round == null ? "" : round.getId().toString(),
                        "resultAnnouncement", true
                ),
                null
        );

        return saved.getId();
    }

    private PublicationFanout sendResultNotifications(HackathonEvent event,
                                                      Round round,
                                                      List<Ranking> rankings,
                                                      User actor,
                                                      PublishResultsRequest request) {
        NotificationChannel channel = resolveResultNotificationChannel(request);
        if (channel == null) {
            return new PublicationFanout(0, false, false);
        }

        Map<UUID, Ranking> rankingByTeam = rankings.stream()
                .filter(ranking -> ranking.getSubmission() != null
                        && ranking.getSubmission().getTeam() != null)
                .collect(Collectors.toMap(
                        ranking -> ranking.getSubmission().getTeam().getId(),
                        Function.identity(),
                        (first, second) -> first.getRound().getOrderIndex()
                                >= second.getRound().getOrderIndex()
                                ? first
                                : second,
                        LinkedHashMap::new)
                );

        int count = 0;
        for (Ranking ranking : rankingByTeam.values()) {
            Team team = ranking.getSubmission().getTeam();
            Round resultRound = round == null ? ranking.getRound() : round;
            String title = "Results published for " + event.getName();
            String body = "%s result is available. Rank #%d in %s%s with total score %.2f."
                    .formatted(
                            team.getName(),
                            ranking.getRankPosition(),
                            ranking.getTrack().getName(),
                            " / " + resultRound.getName(),
                            ranking.getTotalScore()
                    );

            notificationService.createSystemNotification(
                    actor,
                    event,
                    NotificationType.RESULT_PUBLISHED,
                    title,
                    body,
                    NotificationTargetScope.TEAM,
                    team.getId(),
                    null,
                    channel,
                    null
            );
            count++;
        }

        return new PublicationFanout(
                count,
                count > 0 && (channel == NotificationChannel.IN_APP || channel == NotificationChannel.BOTH),
                count > 0 && (channel == NotificationChannel.EMAIL || channel == NotificationChannel.BOTH)
        );
    }

    private NotificationChannel resolveResultNotificationChannel(PublishResultsRequest request) {
        if (request != null && Boolean.FALSE.equals(request.sendNotification())) {
            return null;
        }
        boolean sendInApp = resultSendInApp(request);
        boolean sendEmail = resultSendEmail(request);
        if (!sendInApp && !sendEmail) {
            return null;
        }
        if (sendInApp && sendEmail) {
            return NotificationChannel.BOTH;
        }
        return sendEmail ? NotificationChannel.EMAIL : NotificationChannel.IN_APP;
    }

    private boolean resultSendEmail(PublishResultsRequest request) {
        if (request != null && Boolean.FALSE.equals(request.sendNotification())) {
            return false;
        }
        return request == null || request.sendEmail() == null || Boolean.TRUE.equals(request.sendEmail());
    }

    private boolean resultSendInApp(PublishResultsRequest request) {
        if (request != null && Boolean.FALSE.equals(request.sendNotification())) {
            return false;
        }
        return request == null || request.sendInApp() == null || Boolean.TRUE.equals(request.sendInApp());
    }

    private String resolveAnnouncementTitle(
            HackathonEvent event,
            Round round,
            PublishResultsRequest request
    ) {
        if (request != null && !isBlank(request.announcementTitle())) {
            return request.announcementTitle().trim();
        }
        if (request != null && !isBlank(request.title())) {
            return request.title().trim();
        }
        return defaultResultTitle(event, round);
    }

    private String resolveAnnouncementBody(
            HackathonEvent event,
            Round round,
            PublishResultsRequest request
    ) {
        if (request != null && !isBlank(request.announcementBody())) {
            return request.announcementBody().trim();
        }
        if (request != null && !isBlank(request.content())) {
            return request.content().trim();
        }
        return defaultResultContent(event, round);
    }

    private record PublicationFanout(
            int notifiedCount,
            boolean notificationSent,
            boolean emailQueued
    ) {}

    private List<RankingDraft> sortRankingDraftsWithDisqualifiedLast(List<RankingDraft> trackDrafts) {
        Comparator<RankingDraft> scoredOrder = Comparator
                .comparing(RankingDraft::totalScore, Comparator.reverseOrder())
                .thenComparing(
                        draft -> draft.submission().getSubmittedAt(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                )
                .thenComparing(draft -> safeString(draft.submission().getTeam().getName()));

        Comparator<RankingDraft> disqualifiedOrder = Comparator
                .comparing(
                        (RankingDraft draft) -> draft.submission().getSubmittedAt(),
                        Comparator.nullsLast(Comparator.naturalOrder())
                )
                .thenComparing(draft -> safeString(draft.submission().getTeam().getName()));

        List<RankingDraft> sorted = new ArrayList<>();
        sorted.addAll(trackDrafts.stream()
                .filter(draft -> !isDisqualifiedSubmission(draft.submission()))
                .sorted(scoredOrder)
                .toList());
        sorted.addAll(trackDrafts.stream()
                .filter(draft -> isDisqualifiedSubmission(draft.submission()))
                .sorted(disqualifiedOrder)
                .toList());
        return sorted;
    }

    private void applyTieFlags(List<Ranking> trackRankings) {
        trackRankings.forEach(Ranking::clearTieStatus);

        Map<String, List<Ranking>> rankingsByScore = trackRankings.stream()
                .filter(ranking -> !isDisqualifiedSubmission(ranking.getSubmission()))
                .collect(Collectors.groupingBy(
                        ranking -> tieScoreKey(ranking.getTotalScore()),
                        LinkedHashMap::new,
                        Collectors.toList())
                );

        rankingsByScore.values().stream()
                .filter(group -> group.size() > 1)
                .forEach(group -> {
                    String tieGroupKey = buildTieGroupKey(group.get(0));
                    int tieGroupSize = group.size();
                    group.forEach(ranking -> ranking.markTie(tieGroupKey, tieGroupSize));
                });
    }

    private String buildTieGroupKey(Ranking ranking) {
        return "%s:%s:%s".formatted(
                ranking.getRound().getId(),
                ranking.getTrack().getId(),
                tieScoreKey(ranking.getTotalScore())
        );
    }

    private String tieScoreKey(Double score) {
        return String.format(Locale.ROOT, "%.2f", score == null ? 0.0 : score);
    }

    private RankingDraft buildDisqualifiedRankingDraft(
            Submission submission,
            List<Score> scores,
            Set<UUID> activeCriteriaIds
    ) {
        return buildRankingDraft(submission, scores, activeCriteriaIds)
                .orElseGet(() -> new RankingDraft(
                        submission,
                        submission.getTeam().getTrack(),
                        0.0,
                        0,
                        new LinkedHashMap<>()
                ));
    }

    private boolean isDisqualifiedSubmission(Submission submission) {
        return submission != null && submission.getStatus() == SubmissionStatus.DISQUALIFIED;
    }

    private Optional<RankingDraft> buildRankingDraft(
            Submission submission,
            List<Score> scores,
            Set<UUID> activeCriteriaIds
    ) {
        if (scores == null || scores.isEmpty()) {
            return Optional.empty();
        }

        Map<UUID, List<Score>> scoresByJudge = scores.stream()
                .filter(score -> score.getJudge() != null)
                .collect(Collectors.groupingBy(
                        score -> score.getJudge().getId(),
                        LinkedHashMap::new,
                        Collectors.toList())
                );

        List<Double> judgeWeightedScores = new ArrayList<>();
        Map<String, Map<String, Float>> breakdown = new LinkedHashMap<>();

        for (Map.Entry<UUID, List<Score>> entry : scoresByJudge.entrySet()) {
            Map<UUID, Score> byCriteria = entry.getValue().stream()
                    .collect(Collectors.toMap(
                            score -> score.getEventCriteria().getId(),
                            Function.identity(),
                            (a, b) -> b,
                            LinkedHashMap::new));

            if (!byCriteria.keySet().containsAll(activeCriteriaIds)) {
                // Skip incomplete final sheets.
                // They should not happen when final-submit validation is used,
                // but this keeps ranking calculation safe with old seed/test data.
                continue;
            }

            double weightedSum = 0.0;
            double weightSum = 0.0;
            Map<String, Float> judgeBreakdown = new LinkedHashMap<>();

            for (UUID criteriaId : activeCriteriaIds) {
                Score score = byCriteria.get(criteriaId);
                EventCriteria criterion = score.getEventCriteria();

                double weight = criterion.getEffectiveWeight() == null
                        ? 1.0 : criterion.getEffectiveWeight();

                weightedSum += score.getValue() * weight;
                weightSum += weight;

                judgeBreakdown.put(criteriaId.toString(), score.getValue());
            }

            if (weightSum > 0) {
                judgeWeightedScores.add(weightedSum / weightSum);
                breakdown.put(entry.getKey().toString(), judgeBreakdown);
            }
        }

        if (judgeWeightedScores.isEmpty()) {
            return Optional.empty();
        }

        double totalScore = judgeWeightedScores.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0.0);

        Track track = submission.getTeam().getTrack();

        return Optional.of(new RankingDraft(
                submission,
                track,
                round2(totalScore),
                judgeWeightedScores.size(),
                breakdown
        ));
    }

    private TeamDetailedScoreResponse toTeamDetailedScoreResponse(Ranking ranking) {
        Submission submission = ranking.getSubmission();
        Team team = submission.getTeam();
        Round round = ranking.getRound();
        HackathonEvent event = round.getEvent();
        Track track = ranking.getTrack();

        List<TeamScoreCriterionResponse> criteriaScores =
                buildCriterionAverageScores(ranking);

        return new TeamDetailedScoreResponse(
                event.getId(),
                event.getName(),
                team.getId(),
                team.getName(),
                submission.getId(),
                round.getId(),
                round.getName(),
                track.getId(),
                track.getName(),
                ranking.getTotalScore(),
                ranking.getRankPosition(),
                ranking.getIsAdvanced(),
                ranking.getJudgeCount(),
                publishedAt(ranking),
                criteriaScores
        );
    }

    private List<TeamScoreCriterionResponse> buildCriterionAverageScores(Ranking ranking) {
        if (ranking.getScoreBreakdown() == null || ranking.getScoreBreakdown().isEmpty()) {
            return List.of();
        }

        Set<String> includedJudgeIds = ranking.getScoreBreakdown().keySet();
        Set<String> includedCriteriaIds = ranking.getScoreBreakdown()
                .values()
                .stream()
                .flatMap(scores -> scores.keySet().stream())
                .collect(Collectors.toSet());

        List<Score> confirmedScores = scoreRepository
                .findConfirmedBySubmissionIdWithCriteria(ranking.getSubmission().getId())
                .stream()
                .filter(score -> score.getJudge() != null
                        && includedJudgeIds.contains(score.getJudge().getId().toString()))
                .filter(score -> score.getEventCriteria() != null
                        && includedCriteriaIds.contains(score.getEventCriteria().getId().toString()))
                .toList();

        Map<UUID, List<Score>> byCriteria = confirmedScores.stream()
                .filter(score -> score.getEventCriteria() != null)
                .collect(Collectors.groupingBy(
                        score -> score.getEventCriteria().getId(),
                        LinkedHashMap::new,
                        Collectors.toList())
                );

        return byCriteria.values().stream()
                .map(scores -> {
                    EventCriteria criterion = scores.get(0).getEventCriteria();

                    double average = scores.stream()
                            .map(Score::getValue)
                            .filter(Objects::nonNull)
                            .mapToDouble(Float::doubleValue)
                            .average()
                            .orElse(0.0);

                    String category = criterion.getCriteria() == null
                            || criterion.getCriteria().getCategory() == null
                            ? null : criterion.getCriteria().getCategory().name();

                    return new TeamScoreCriterionResponse(
                            criterion.getId(),
                            criterion.getEffectiveName(),
                            category,
                            criterion.getEffectiveIsTechnical(),
                            round2(average),
                            criterion.getEffectiveMaxScore() == null
                                    ? null : criterion.getEffectiveMaxScore().doubleValue(),
                            criterion.getEffectiveWeight() == null
                                    ? null : criterion.getEffectiveWeight().doubleValue(),
                            scores.size()
                    );
                })
                .toList();
    }


    private RankingResponse toRankingResponse(Ranking ranking) {
        return toRankingResponse(ranking, true);
    }

    private RankingResponse toPublicRankingResponse(Ranking ranking) {
        return toRankingResponse(ranking, false);
    }

    private RankingResponse toRankingResponse(Ranking ranking, boolean includeScoreBreakdown) {
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
                ranking.getTied(),
                ranking.getTieGroupKey(),
                ranking.getTieGroupSize(),
                ranking.getManualResolutionRequired(),
                ranking.getIsAdvanced(),
                ranking.getJudgeCount(),
                includeScoreBreakdown ? ranking.getScoreBreakdown() : null,
                ranking.getCalculatedAt(),
                isRankingPublished(ranking),
                ranking.getAdvanceReason() == null ? null : ranking.getAdvanceReason().name(),
                submission.getStatus() == null ? null : submission.getStatus().name(),
                team.getStatus() == null ? null : team.getStatus().name()
        );
    }

    private TeamRankingHistoryResponse toTeamRankingHistoryResponse(Ranking ranking) {
        return new TeamRankingHistoryResponse(
                ranking.getRound().getId(),
                ranking.getRound().getName(),
                ranking.getTrack().getId(),
                ranking.getTrack().getName(),
                ranking.getTotalScore(),
                ranking.getRankPosition(),
                ranking.getIsAdvanced()
        );
    }

    private boolean isRankingPublished(Ranking ranking) {
        return publishedAt(ranking) != null;
    }

    private LocalDateTime publishedAt(Ranking ranking) {
        if (ranking.getRound().getResultPublishedAt() != null) {
            return ranking.getRound().getResultPublishedAt();
        }
        return ranking.getRound().getEvent().getResultPublishedAt();
    }

    private String defaultResultTitle(HackathonEvent event, Round round) {
        if (round == null) {
            return "Final results published for " + event.getName();
        }
        return "Results published for " + round.getName();
    }

    private String defaultResultContent(HackathonEvent event, Round round) {
        if (round == null) {
            return "Final rankings and team scores for " + event.getName() + " are now available.";
        }
        return "Rankings and team scores for round " + round.getName() + " are now available.";
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }

    private String safeString(String value) {
        return value == null ? "" : value;
    }

    private double round2(double value) {
        return Math.round(value * 100.0) / 100.0;
    }
}
