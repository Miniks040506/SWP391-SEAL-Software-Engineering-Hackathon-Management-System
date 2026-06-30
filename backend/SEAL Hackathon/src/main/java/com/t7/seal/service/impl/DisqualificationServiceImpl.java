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

import java.util.List;
import java.util.UUID;

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
        return toResponse(saved, recalculation != null, clearedAwardCount);
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
}
