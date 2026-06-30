package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.*;
import com.t7.seal.request.results.*;
import com.t7.seal.response.results.PrizeAssignmentResponse;
import com.t7.seal.response.results.PrizeResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.PrizeService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.lang.reflect.AccessFlag;
import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class PrizeServiceImpl implements PrizeService {

    private final PrizeRepository prizeRepository;
    private final HackathonEventRepository eventRepository;
    private final TrackRepository trackRepository;
    private final RoundRepository roundRepository;
    private final TeamRepository teamRepository;
    private final RankingRepository rankingRepository;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;
    private final NotificationService notificationService;

    @Transactional
    @Override
    public PrizeResponse createPrize(CreatePrizeRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        validateCreatePrizeRequest(request);

        HackathonEvent event = findEvent(request.eventId());
        assertPrizeEditable(event);
        Track track = resolveTrack(event.getId(), request.trackId());

        if (prizeRepository.existsSameRank(event.getId(), request.trackId(), request.rankPosition())) {
            throw new ConflictException("Prize rank already exists for this event/track.");
        }

        Prize prize = new Prize();
        prize.setEvent(event);
        prize.setTrack(track);
        prize.setRankPosition(request.rankPosition());
        prize.setTitle(request.title().trim());
        prize.setDescription(trimToNull(request.description()));
        prize.setValue(request.value());
        prize.setCurrency(request.currency() == null || request.currency().isBlank()
                ? "VND"
                : request.currency().trim().toUpperCase());
        prize.setSponsorName(trimToNull(request.sponsorName()));

        Prize saved = prizeRepository.save(prize);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_CREATED,
                "prizes",
                saved.getId(),
                null,
                auditPrize(prize),
                auditContext(event.getId(), null, null, null)
        );

        return toPrizeResponse(saved);
    }

    @Transactional
    @Override
    public PrizeResponse updatePrize(UUID prizeId, UpdatePrizeRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        Prize prize = findPrize(prizeId, null, null);
        assertPrizeEditable(prize.getEvent());

        Map<String, Object> before = auditPrize(prize);

        UUID trackId = prize.getTrack() == null ? null : prize.getTrack().getId();
        Integer newRank = request.rankPosition() == null ? prize.getRankPosition() : request.rankPosition();

        if (request.rankPosition() != null) {
            if (request.rankPosition() < 1) {
                throw new BadRequestException("rankPosition must be greater than 0.");
            }
            if (prizeRepository.existsSameRankExceptSelf(prizeId, prize.getEvent().getId(), trackId, newRank)) {
                throw new ConflictException("Prize rank already exists for this event/track.");
            }
            prize.setRankPosition(request.rankPosition());
        }

        if (request.title() != null) {
            if (request.title().isBlank()) {
                throw new BadRequestException("Prize title cannot be blank.");
            }
            prize.setTitle(request.title().trim());
        }
        if (request.description() != null) {
            prize.setDescription(trimToNull(request.description()));
        }
        if (request.value() != null) {
            validateNonNegative(request.value(), "value");
            prize.setValue(request.value());
        }
        if (request.currency() != null) {
            prize.setCurrency(request.currency().trim().toUpperCase());
        }
        if (request.sponsorName() != null) {
            prize.setSponsorName(trimToNull(request.sponsorName()));
        }

        Prize saved = prizeRepository.save(prize);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_UPDATED,
                "prize",
                saved.getId(),
                before,
                auditPrize(prize),
                auditContext(prize.getEvent().getId(), trackId, null, null)
        );

        return toPrizeResponse(saved);
    }

    @Transactional
    @Override
    public void deletePrize(UUID prizeId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        Prize prize = findPrize(prizeId, null, null);
        assertPrizeEditable(prize.getEvent());
        if (prize.getAwardedTeam() != null) {
            throw new ConflictException("Cannot delete prize after it has been awarded. Clear award first.");
        }

        Map<String, Object> before = auditPrize(prize);
        UUID eventId = prize.getEvent().getId();
        UUID trackId = prize.getTrack() == null ? null : prize.getTrack().getId();

        prizeRepository.delete(prize);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_DELETED,
                "prize",
                prizeId,
                before,
                null,
                auditContext(eventId, trackId, null, null)
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<PrizeResponse> getPrizesByEvent(UUID eventId) {
        return prizeRepository.findByEventIdOrderByTrackNameAndRankPositionAsc(eventId)
                .stream()
                .map(this::toPrizeResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public PrizeResponse getPrizeById(UUID prizeId) {
        Prize prize = findPrize(prizeId, null, null);
        return toPrizeResponse(prize);
    }

    @Transactional
    @Override
    public PrizeResponse awardPrize(UUID prizeId, AwardPrizeRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);

        if (request == null || request.teamId() == null) {
            throw new BadRequestException("Team id is required.");
        }

        Prize prize = findPrize(prizeId, null, null);
        ensureResultPublishedForAwards(prize.getEvent());

        Team team = teamRepository.findCoordinatorDetailById(request.teamId())
                .orElseThrow(() -> new NotFoundException("Team not found."));

        validateManualAwardTeam(prize, team);

        Map<String, Object> before = auditPrize(prize);
        awardPrizeToTeam(team, prize);
        Prize saved = prizeRepository.save(prize);
        markTeamAsWinner(team);

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_AWARDED,
                "prizes",
                prizeId,
                before,
                auditPrize(saved),
                auditContext(saved.getEvent().getId(), prizeTrackId(prize), null,
                        trimToNull(request.reason()) == null ? "MANUAL_AWARD" : request.reason().trim())
        );
        mayBeNotifyPrizeWinner(actor, saved.getEvent(), saved, team, request);

        return toPrizeResponse(saved);
    }

    @Transactional
    @Override
    public PrizeResponse clearPrize(UUID prizeId, ClearPrizeAwardRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        Prize prize = findPrize(prizeId, null, null);
        Map<String, Object> before = auditPrize(prize);

        Team oldWinner = prize.getAwardedTeam();
        if (oldWinner == null) {
            return toPrizeResponse(prize);
        }

        prize.clearAward();
        Prize saved = prizeRepository.save(prize);

        if (oldWinner.getStatus() == TeamStatus.WINNER
                && prizeRepository.countAwardedByEventIdAndTeamIdExceptPrize(
                saved.getEvent().getId(), oldWinner.getId(), saved.getId()) == 0
        ) {
            oldWinner.setStatus(TeamStatus.ADVANCED);
            teamRepository.save(oldWinner);
        }

        auditLogService.record(
                actor,
                AuditActionType.PRIZE_AWARD_CLEARED,
                "prizes",
                saved.getId(),
                before,
                auditPrize(saved),
                auditContext(saved.getEvent().getId(), prizeTrackId(saved), null,
                        request == null ? null : trimToNull(request.reason()))
        );

        return toPrizeResponse(saved);
    }

    @Transactional
    @Override
    public PrizeAssignmentResponse assignPrizesFromRanking(UUID eventId, AssignPrizesFromRankingRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        HackathonEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found."));

        ensureResultPublishedForAwards(event);

        UUID requestedTrackId = (request == null) ? null : request.trackId();
        Track requestedTrack = resolveTrack(eventId, requestedTrackId);
        Round awardRound = resolveAwardRound(event, request == null ? null : request.roundId());
        Boolean override = request != null && Boolean.TRUE.equals(request.overwriteExistingAwards());

        List<Prize> prizes = prizeRepository.findByEventIdOrderByTrackNameAndRankPositionAsc(eventId)
                .stream()
                .filter(p -> requestedTrack == null
                        || (p.getTrack() != null && p.getTrack().getId().equals(requestedTrack.getId())))
                .toList();
        if (prizes.isEmpty()) {
            throw new ConflictException("No prizes are configured for this event's track.");
        }

        List<Ranking> rankings = rankingRepository.findByEventRoundTrackWithDetails(
                        event.getId(),
                        awardRound.getId(),
                        requestedTrack == null ? null : requestedTrack.getId())
                .stream()
                .filter(this::isAwardableRanking)
                .toList();
        if (rankings.isEmpty()) {
            throw new ConflictException("No eligible rankings were found for this prize assignment.");
        }

        int awarded = 0;
        int skipped = 0;
        for (Prize prize : prizes) {
            if (prize.isAwarded() && !override) {
                skipped++;
                continue;
            }

            Optional<Ranking> winnerRanking = findRankingForPrize(prize, rankings);
            if (winnerRanking.isEmpty()) {
                skipped++;
                continue;
            }

            Team winnerTeam = winnerRanking.get().getSubmission().getTeam();
            Map<String, Object> before = auditPrize(prize);
            awardPrizeToTeam(winnerTeam, prize);
            Prize saved = prizeRepository.save(prize);
            markTeamAsWinner(winnerTeam);

            auditLogService.record(
                    actor,
                    AuditActionType.PRIZE_AWARDED,
                    "prizes",
                    saved.getId(),
                    before,
                    auditPrize(prize),
                    auditContext(eventId, awardRound.getId(), prizeTrackId(saved),
                            "AUTO_ASSIGN_FROM_RANKING")
            );
            mayBeNotifyPrizeWinner(actor, event, saved, winnerTeam, request);
            awarded++;
        }

        List<PrizeResponse> prizeResponses = prizeRepository.findByEventIdOrderByTrackNameAndRankPositionAsc(event.getId())
                .stream()
                .filter(p -> requestedTrack == null
                        || (p.getTrack() != null && p.getTrack().getId().equals(requestedTrack.getId())))
                .map(this::toPrizeResponse)
                .toList();

        return new PrizeAssignmentResponse(
                event.getId(),
                awardRound.getId(),
                requestedTrack == null ? null : requestedTrack.getId(),
                prizes.size(),
                awarded,
                skipped,
                awarded > 0 && shouldSendInApp(request),
                awarded > 0 && shouldSendEmail(request),
                LocalDateTime.now(),
                prizeResponses
        );
    }

    @Transactional(readOnly = true)
    @Override
    public List<PrizeResponse> getPublishedAwards(UUID eventId) {
        HackathonEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found."));

        if (!hasPublishedResults(event)) {
            return List.of();
        }

        return prizeRepository.findAwardedByEventIdOrderByTrackNameAndRankPositionAsc(eventId)
                .stream()
                .map(this::toPrizeResponse)
                .toList();
    }

    //HELPERS

    private Optional<Ranking> findRankingForPrize(Prize prize, List<Ranking> rankings) {
        if (prize.getTrack() != null) {
            return rankings.stream()
                    .filter(r -> r.getTrack().getId().equals(prize.getTrack().getId()))
                    .filter(r -> Objects.equals(r.getRankPosition(), prize.getRankPosition()))
                    .findFirst();
        }

        return rankings.stream()
                .sorted(Comparator
                        .comparing(Ranking::getTotalScore, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(Ranking::getJudgeCount, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(r -> r.getSubmission().getTeam().getName(), String.CASE_INSENSITIVE_ORDER)
                        .thenComparing(r -> r.getSubmission().getTeam().getId())
                )
                .skip((long) prize.getRankPosition() - 1L)
                .findFirst();
    }

    private boolean shouldSendInApp(AssignPrizesFromRankingRequest request) {
        boolean shouldNotify = (request == null)
                || (request.sendNotification() == null)
                || (Boolean.TRUE.equals(request.sendNotification()));
        boolean shouldUseInApp = (request == null)
                || (request.sendInApp() == null)
                || (Boolean.TRUE.equals(request.sendInApp()));
        return shouldNotify && shouldUseInApp;
    }

    private boolean shouldSendEmail(AssignPrizesFromRankingRequest request) {
        boolean shouldNotify = (request == null)
                || (request.sendNotification() == null)
                || (Boolean.TRUE.equals(request.sendNotification()));
        boolean shouldUseEmail = (request == null)
                || (request.sendEmail() == null)
                || (Boolean.TRUE.equals(request.sendEmail()));
        return shouldNotify && shouldUseEmail;
    }

    private Round resolveAwardRound(HackathonEvent event, UUID roundId) {
        if (roundId != null) {
            Round round = roundRepository.findById(roundId)
                    .orElseThrow(() -> new NotFoundException("Round not found."));
            if (!round.getEvent().getId().equals(event.getId())) {
                throw new BadRequestException("Round does not belong to this event.");
            }
            if (round.getResultPublishedAt() == null && event.getResultPublishedAt() == null) {
                throw new ConflictException("Round result must be published before assigning prizes.");
            }
            return round;
        }
        List<Round> rounds = roundRepository.findByEventIdOrderByOrderIndexAsc(event.getId());
        if (rounds.isEmpty()) {
            throw new ConflictException("Cannot assign prizes without configure rounds.");
        }
        return rounds.stream().filter(r -> r.getResultPublishedAt() != null
                        || event.getResultPublishedAt() != null)
                .max(Comparator.comparing(Round::getOrderIndex))
                .orElseThrow(() -> new ConflictException("No publish round result for round assignment."));
    }

    private void mayBeNotifyPrizeWinner(
            User actor,
            HackathonEvent event,
            Prize prize,
            Team team,
            AwardPrizeRequest request
    ) {
        if (request != null && Boolean.FALSE.equals(request.sendNotification())) {
            return;
        }
        notifyPrizeWinner(actor, event, prize, team, resolveChannel(request));
    }

    private void mayBeNotifyPrizeWinner(
            User actor,
            HackathonEvent event,
            Prize prize,
            Team team,
            AssignPrizesFromRankingRequest request
    ) {
        if (request != null && Boolean.FALSE.equals(request.sendNotification())) {
            return;
        }
        notifyPrizeWinner(actor, event, prize, team, resolveChannel(request));
    }

    private void notifyPrizeWinner(
            User actor,
            HackathonEvent event,
            Prize prize,
            Team team,
            NotificationChannel channel
    ) {
        if (channel == null) {
            return;
        }
        String title = "Prize Awarded: " + prize.getTitle();
        String body = "%s received %s for %s%s".formatted(
                team.getName(),
                prize.getTitle(),
                event.getName(),
                prize.getTrack() == null ? "" : " / " + prize.getTrack().getName()
        );
        notificationService.createSystemNotification(
                actor,
                event,
                NotificationType.PRIZE_AWARDED,
                title,
                body,
                NotificationTargetScope.TEAM,
                team.getId(),
                null,
                channel,
                null
        );
    }

    private NotificationChannel resolveChannel(AssignPrizesFromRankingRequest request) {
        boolean inApp = (request == null) || (request.sendInApp() == null) || (Boolean.TRUE.equals(request.sendInApp()));
        boolean email = (request == null) || (request.sendEmail() == null) || (Boolean.TRUE.equals(request.sendEmail()));

        if (!inApp && !email) {
            return null;
        }

        return inApp && email ? NotificationChannel.BOTH : inApp ? NotificationChannel.IN_APP : NotificationChannel.EMAIL;
    }

    private NotificationChannel resolveChannel(AwardPrizeRequest request) {
        boolean inApp = (request == null) || (request.sendInApp() == null) || (Boolean.TRUE.equals(request.sendInApp()));
        boolean email = (request == null) || (request.sendEmail() == null) || (Boolean.TRUE.equals(request.sendEmail()));

        if (!inApp && !email) {
            return null;
        }

        return inApp && email ? NotificationChannel.BOTH : inApp ? NotificationChannel.IN_APP : NotificationChannel.EMAIL;
    }

    private void markTeamAsWinner(Team team) {
        if (team.getStatus() != TeamStatus.WINNER) {
            team.setStatus(TeamStatus.WINNER);
            teamRepository.save(team);
        }
    }

    private void awardPrizeToTeam(Team team, Prize prize) {
        prize.awardTo(team);
    }

    private void validateManualAwardTeam(Prize prize, Team team) {
        if (team.getTrack() == null || team.getTrack().getEvent() == null) {
            throw new BadRequestException("Team is not registered to an event's track.");
        }
        if (!team.getTrack().getEvent().getId().equals(prize.getEvent().getId())) {
            throw new BadRequestException("Team does not belong to this prize event.");
        }
        if (prize.getTrack() != null && !prize.getTrack().getId().equals(team.getTrack().getId())) {
            throw new BadRequestException("Track specific prize can only be awarded to a team in the same track.");
        }
        if (team.getStatus() == TeamStatus.ELIMINATED) {
            throw new ConflictException("Eliminated or disqualified teams cannot be awarded prizes.");
        }

        boolean hasEligibleRanking = rankingRepository.findByEventRoundTrackWithDetails(
                        prize.getEvent().getId(), null, prizeTrackId(prize)
                ).stream()
                .anyMatch(r -> isAwardableRanking(r)
                        && r.getSubmission().getTeam().getId().equals(team.getId()));

        if (!hasEligibleRanking) {
            throw new ConflictException("Team does not have an eligible publish ranking for this prize.");
        }
    }

    private boolean isAwardableRanking(Ranking ranking) {
        return ranking != null
                && ranking.getSubmission() != null
                && ranking.getSubmission().getTeam() != null
                && ranking.getSubmission().getStatus() != SubmissionStatus.DISQUALIFIED
                && ranking.getSubmission().getTeam().getStatus() != TeamStatus.ELIMINATED;
    }

    private UUID prizeTrackId(Prize prize) {
        return prize.getTrack() == null ? null : prize.getTrack().getId();
    }

    private void ensureResultPublishedForAwards(HackathonEvent event) {
        if (!hasPublishedResults(event)) {
            throw new ConflictException("Result must be published before awarding prizes.");
        }
    }

    private boolean hasPublishedResults(HackathonEvent event) {
        return event.getResultPublishedAt() != null
                || roundRepository.existsByEventIdAndResultPublishedAtIsNotNull(event.getId());
    }

    private void assertPrizeEditable(HackathonEvent event) {
        RegistrationStatus status = event.getStatus();

        if (status == RegistrationStatus.JUDGING
                || status == RegistrationStatus.COMPLETED
                || status == RegistrationStatus.CANCELLED) {
            throw new ConflictException("Prizes are locked in event status " + status + ".");
        }
    }

    private HackathonEvent findEvent(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required.");
        }
        return eventRepository.findByIdCanAssignedPrize(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found."));
    }

    private Track resolveTrack(UUID eventId, UUID trackId) {
        if (trackId == null) {
            return null;
        }
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new NotFoundException("Track not found."));
        if (!track.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Track does not belong to this event.");
        }
        return track;
    }

    private Prize findPrize(UUID prizeId, UUID eventId, UUID trackId) {
        if (prizeId == null) {
            throw new BadRequestException("Prize id is required.");
        }
        return prizeRepository.findPrizeByIdInEventAndTrack(prizeId, eventId, trackId)
                .orElseThrow(() -> new NotFoundException("Prize not found."));
    }

    private void validateCreatePrizeRequest(CreatePrizeRequest request) {
        if (request.eventId() == null) {
            throw new BadRequestException("eventId is required.");
        }
        if (request.rankPosition() == null || request.rankPosition() < 1) {
            throw new BadRequestException("rankPosition must be greater than 0.");
        }
        if (request.title() == null || request.title().isBlank()) {
            throw new BadRequestException("Prize title is required.");
        }
        if (request.value() != null) {
            validateNonNegative(request.value(), "value");
        }
    }

    private void validateNonNegative(BigDecimal value, String fieldName) {
        if (value.compareTo(BigDecimal.ZERO) < 0) {
            throw new BadRequestException(fieldName + " must not be negative.");
        }
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private PrizeResponse toPrizeResponse(Prize prize) {
        return new PrizeResponse(
                prize.getId(),
                prize.getEvent().getId(),
                prize.getEvent().getName(),
                prize.getTrack() == null ? null : prize.getTrack().getId(),
                prize.getTrack() == null ? null : prize.getTrack().getName(),
                prize.getRankPosition(),
                prize.getTitle(),
                prize.getDescription(),
                prize.getValue(),
                prize.getCurrency(),
                prize.getSponsorName(),
                prize.getAwardedTeam() == null ? null : prize.getAwardedTeam().getId(),
                prize.getAwardedTeam() == null ? null : prize.getAwardedTeam().getName(),
                prize.getAwardedAt()
        );
    }

    private Map<String, Object> auditPrize(Prize prize) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("id", prize.getId() == null ? null : prize.getId().toString());
        state.put("eventId", prize.getEvent() == null ? null : prize.getEvent().getId().toString());
        state.put("trackId", prize.getTrack() == null ? null : prize.getTrack().getId().toString());
        state.put("rankPosition", prize.getRankPosition());
        state.put("title", prize.getTitle());
        state.put("value", prize.getValue());
        state.put("currency", prize.getCurrency());
        state.put("awardedTeamId", prize.getAwardedTeam() == null
                ? null : prize.getAwardedTeam().getId().toString());
        state.put("awardedAt", prize.getAwardedAt() == null
                ? null : prize.getAwardedAt().toString());

        return state;
    }

    private Map<String, Object> auditContext(UUID eventId, UUID trackId, UUID roundId, String reason) {
        Map<String, Object> context = new LinkedHashMap<>();
        context.put("eventId", eventId == null ? null : eventId.toString());
        context.put("trackId", trackId == null ? null : trackId.toString());
        context.put("roundId", roundId == null ? null : roundId.toString());
        context.put("reason", reason);

        return context;
    }
}
