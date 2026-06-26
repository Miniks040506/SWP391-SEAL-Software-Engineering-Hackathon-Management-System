package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.RegistrationStatus;
import com.t7.seal.entities.*;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.EventAnnouncementRepository;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RankingRepository;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;
import com.t7.seal.response.submission.TeamDetailedScoreResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.RankingService;
import jdk.jfr.Event;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RankingRepository rankingRepository;
    private final HackathonEventRepository eventRepository;
    private final EventAnnouncementRepository eventAnnouncementRepository;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    @Override
    public List<RankingResponse> getRankings(UUID eventId, UUID trackId, UUID roundId) {
        return rankingRepository.getPublicRankings(eventId, trackId, roundId)
                .stream()
                .map(this::toRankingResponse)
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

    @Override
    public RankingRecalculationResponse calculateRoundRankings(
            UUID roundId,
            UUID trackId,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    public PublishResultsResponse publishEventResults(
            UUID eventId,
            PublishResultsRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        HackathonEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found " + eventId));

        ensureEventCanPublish(event);

        List<Ranking> rankings = rankingRepository.findByEventRoundTrackWithDetails(eventId, null, null);
        if (rankings.isEmpty()) {
            throw new ConflictException("Cannot publish results before rankings are calculated.");
        }

        LocalDateTime now = LocalDateTime.now();
        event.publishResults(now);
        eventRepository.save(event);

        UUID announcementId = createResultAnnouncement(event, null, actor, request, now);
        int notifiedCount = sendResultNotifications(event, null, rankings, actor, request);

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
                        "scope", "EVENT"
                ),
                null
        );

        return new PublishResultsResponse(
                event.getId(),
                null,
                now,
                announcementId,
                notifiedCount
        );
    }

    @Override
    public PublishResultsResponse publishRoundResults(
            UUID roundId,
            PublishResultsRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    public List<TeamDetailedScoreResponse> getPublishedTeamScores(
            UUID teamId,
            Authentication authentication
    ) {
        return List.of();
    }

    @Override
    public TeamDetailedScoreResponse getPublishedTeamRoundScore(
            UUID teamId,
            UUID roundId,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    public TeamDetailedScoreResponse getPublishedSubmissionScore(
            UUID submissionId,
            Authentication authentication
    ) {
        return null;
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

    private UUID createResultAnnouncement(HackathonEvent event,
                                          Round round,
                                          User actor,
                                          PublishResultsRequest request,
                                          LocalDateTime publishedAt) {
        if (request != null && Boolean.FALSE.equals(request.createAnnouncement())) {
            return null;
        }

        String title = request == null || isBlank(request.title())
                ? defaultResultTitle(event, round)
                : request.title().trim();
        String content = request == null || isBlank(request.content())
                ? defaultResultContent(event, round)
                : request.content().trim();

        EventAnnouncement announcement = EventAnnouncement.builder()
                .event(event)
                .title(title)
                .content(content)
                .isPinned(true)
                .isResultAnnouncement(true)
                .sendEmail(false)
                .sendInApp(true)
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
                isRankingPublished(ranking)
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
}
