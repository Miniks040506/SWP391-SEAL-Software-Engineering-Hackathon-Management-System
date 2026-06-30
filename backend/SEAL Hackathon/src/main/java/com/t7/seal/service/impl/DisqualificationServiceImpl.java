package com.t7.seal.service.impl;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.DisqualificationRepository;
import com.t7.seal.repository.SubmissionRepository;
import com.t7.seal.repository.TeamRepository;
import com.t7.seal.request.results.CreateDisqualificationRequest;
import com.t7.seal.request.results.DisqualifySubmissionRequest;
import com.t7.seal.request.results.OverturnDisqualificationRequest;
import com.t7.seal.request.results.UpdateAppealRequest;
import com.t7.seal.response.results.DisqualificationResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.DisqualificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class DisqualificationServiceImpl implements DisqualificationService {

    private final DisqualificationRepository disqualificationRepository;
    private final SubmissionRepository submissionRepository;
    private final TeamRepository teamRepository;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public DisqualificationResponse createDisqualificationSubmission(
            CreateDisqualificationRequest request,
            Authentication authentication
    ) {
        if (request == null || request.submissionId() == null) {
            throw new BadRequestException("submissionId is required.");
        }
        return disqualifySubmission(
                request.submissionId(),
                new DisqualifySubmissionRequest(request.reason(), request.evidenceUrl()),
                authentication
        );
    }

    @Override
    @Transactional
    public DisqualificationResponse disqualifySubmission(
            UUID submissionId,
            DisqualifySubmissionRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        String reason = requireText(request == null ? null : request.reason(), "Disqualification reason is required.");
        String evidenceUrl = trimToNull(request == null ? null : request.evidenceUrl());

        Submission submission = submissionRepository.findDetailById(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found " + submissionId));
        if (submission.getStatus() == SubmissionStatus.DISQUALIFIED) {
            throw new ConflictException("Submission has already been disqualified.");
        }
        if (!submission.isScorable()) {
            throw new ConflictException("Only SUBMITTED or LATE submissions can be disqualified.");
        }
        Disqualification existing = disqualificationRepository.findBySubmissionIdWithDetails(submissionId)
                .orElse(null);
        if (existing != null && !existing.isAppealOverturned()) {
            throw new ConflictException("Submission already has an active disqualification record.");
        }

        Team team = requireTeam(submission);
        Round round = requireRound(submission);
        HackathonEvent event = requireEvent(round);
        UUID trackId = team.getTrack() == null ? null : team.getTrack().getId();
        SubmissionStatus beforeSubmissionStatus = submission.getStatus();
        TeamStatus beforeTeamStatus = team.getStatus();

        Disqualification disqualification = existing == null
                ? Disqualification.builder()
                .submission(submission)
                .issuedBy(actor)
                .reason(reason)
                .evidenceUrl(evidenceUrl)
                .build()
                : existing;
        disqualification.setIssuedBy(actor);
        disqualification.setReason(reason);
        disqualification.setEvidenceUrl(evidenceUrl);
        disqualification.setAppealNote(null);
        disqualification.setAppealStatus(null);

        submission.markDisqualified();
        if (team.getStatus() != TeamStatus.ELIMINATED) {
            team.setStatus(TeamStatus.ELIMINATED);
        }

        Disqualification saved = disqualificationRepository.save(disqualification);
        submissionRepository.save(submission);
        teamRepository.save(team);

        int clearedAwardCount = clearAwardsForTeam(event.getId(), team, actor, saved.getId());
        RankingRecalculationResponse recalculation = recalculateIfPossible(round, trackId, authentication);

        auditLogService.record(
                actor,
                AuditActionType.TEAM_DISQUALIFIED,
                "disqualifications",
                saved.getId(),
                mapOf(
                        "submissionStatus", beforeSubmissionStatus.name(),
                        "teamStatus", beforeTeamStatus == null ? null : beforeTeamStatus.name()
                ),
                mapOf(
                        "submissionStatus", submission.getStatus().name(),
                        "teamStatus", team.getStatus() == null ? null : team.getStatus().name(),
                        "reason", reason,
                        "evidenceUrl", evidenceUrl
                ),
                mapOf(
                        "eventId", event.getId().toString(),
                        "roundId", round.getId().toString(),
                        "trackId", trackId == null ? null : trackId.toString(),
                        "teamId", team.getId().toString(),
                        "submissionId", submission.getId().toString(),
                        "rankingRecalculated", recalculation != null,
                        "clearedAwardCount", clearedAwardCount
                )
        );

        sendDisqualificationNotification(actor, event, team, saved);
        return toDisqualificationResponse(saved, recalculation != null, clearedAwardCount);
    }

    @Override
    public DisqualificationResponse getDisqualificationById(UUID disqualificationId, Authentication authentication) {
        return null;
    }

    @Override
    public List<DisqualificationResponse> getDisqualificationsByEvent(UUID eventId, UUID roundId, UUID trackId, String appealStatus, Authentication authentication) {
        return List.of();
    }

    @Override
    public DisqualificationResponse updateAppeal(UUID disqualificationId, UpdateAppealRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public DisqualificationResponse overturnDisqualification(UUID disqualificationId, OverturnDisqualificationRequest request, Authentication authentication) {
        return null;
    }

    //HELPER METHODS

    private DisqualificationResponse toDisqualificationResponse(
            Disqualification disqualification,
            boolean rankingRecalculated,
            int clearedAwardCount
    ) {
        Submission submission = disqualification.getSubmission();
        Team team = requireTeam(submission);
        Round round = requireRound(submission);
        HackathonEvent event = requireEvent(round);

        return new DisqualificationResponse(
                disqualification.getId(),
                submission.getId(),
                disqualification.getIssuedBy() == null
                        ? null : disqualification.getIssuedBy().getId(),
                disqualification.getIssuedBy() == null
                        ? null : disqualification.getIssuedBy().getFullName(),
                team.getId(),
                team.getName(),
                event.getId(),
                event.getName(),
                round.getId(),
                round.getName(),
                team.getTrack() == null ? null : team.getTrack().getId(),
                team.getTrack() == null ? null : team.getTrack().getName(),
                disqualification.getReason(),
                disqualification.getEvidenceUrl(),
                disqualification.getAppealNote(),
                disqualification.getAppealStatus() == null
                        ? null : disqualification.getAppealStatus().name(),
                submission.getStatus() == null
                        ? null : submission.getStatus().name(),
                team.getStatus() == null
                        ? null : team.getStatus().name(),
                disqualification.getIssuedAt(),
                rankingRecalculated,
                clearedAwardCount
        );
    }

    private String requireText(String value, String message) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException(message);
        }
        return value.trim();
    }

    private String trimToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Team requireTeam(Submission submission) {
        if (submission == null || submission.getTeam() == null) {
            throw new ConflictException("Submission team is missing.");
        }
        return submission.getTeam();
    }

    private Round requireRound(Submission submission) {
        if (submission == null || submission.getRound() == null) {
            throw new ConflictException("Submission round is missing.");
        }
        return submission.getRound();
    }

    private HackathonEvent requireEvent(Round round) {
        if (round == null || round.getEvent() == null) {
            throw new ConflictException("Round event is missing.");
        }
        return round.getEvent();
    }

    private UUID submissionId(Disqualification disqualification) {
        return disqualification.getSubmission().getId();
    }

    private UUID teamId(Disqualification disqualification) {
        return requireTeam(disqualification.getSubmission()).getId();
    }

    private UUID roundId(Disqualification disqualification) {
        return requireRound(disqualification.getSubmission()).getId();
    }

    private UUID eventId(Disqualification disqualification) {
        return requireEvent(requireRound(disqualification.getSubmission())).getId();
    }

    private Map<String, Object> mapOf(Object... keyValues) {
        Map<String, Object> map = new LinkedHashMap<>();

        for (int i = 0; i + 1 < keyValues.length; i += 2) {
            Object value = keyValues[i + 1];
            if (value != null) {
                map.put(Objects.toString(keyValues[i]), value);
            }
        }
        
        return map;
    }
}
