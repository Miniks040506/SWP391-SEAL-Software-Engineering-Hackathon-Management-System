package com.t7.seal.service.impl;

import com.t7.seal.domain.RoundStatus;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.TeamStatus;
import com.t7.seal.entities.Round;
import com.t7.seal.entities.Submission;
import com.t7.seal.entities.Team;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.submission.*;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private final SubmissionRepository submissionRepository;
    private final SubmissionLinkRepository submissionLinkRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;

    @Override
    @Transactional
    public SubmissionResponse submitDeliverables(
            UUID teamId, UUID roundId,
            SubmitDeliverablesRequest request,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);
        Round round = getRound(roundId);

        ensureRoundBelongToTeamEvent(team, round);
        ensureTeamLeader(team, authentication);
        ensureTeamCanSubmit(team);
        ensureRoundCanAcceptSubmission(round);
        validateRequiredLinks(team, request.links());

        Submission submission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .orElseGet(() -> Submission.builder()
                        .team(team)
                        .round(round)
                        .status(SubmissionStatus.DRAFT)
                        .submissionNumber(1)
                        .submissionLinks(new ArrayList<>())
                        .build());

        return null;
    }

    @Override
    public SubmissionResponse uploadSubmissionFile(UUID teamId, UUID roundId, String linkType, String note, String label, Boolean isPrimary, Integer displayOrder, Boolean submitNow, MultipartFile file, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse uploadFileToSubmission(UUID submissionId, String linkType, String label, Boolean isPrimary, Integer displayOrder, Boolean submitNow, MultipartFile file, Authentication authentication) {
        return null;
    }

    @Override
    public List<SubmissionSummaryResponse> getTeamSubmissions(UUID teamId, Authentication authentication) {
        return List.of();
    }

    @Override
    public SubmissionDetailResponse getSubmissionById(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionDetailResponse getSubmissionForAdmin(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse updateSubmission(UUID submissionId, UpdateSubmissionRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse addSubmissionLinks(UUID submissionId, SubmissionLinkRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionLinkResponse updateSubmissionLink(UUID linkId, SubmissionLinkRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public void deleteSubmissionLink(UUID linkId, Authentication authentication) {

    }

    @Override
    public FileDownloadUrlResponse createSubmissionFileDownloadUrl(UUID linkId, Authentication authentication) {
        return null;
    }

    @Override
    public SubmissionResponse submitExistingSubmission(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Override
    public PageResponse<CoordinatorSubmissionSummaryResponse> getEventSubmissions(UUID eventId, UUID roundId, UUID trackId, String status, String search, int page, int size, Authentication authentication) {
        return null;
    }

    @Override
    public List<SubmissionSummaryResponse> getRoundSubmissions(UUID roundId, Authentication authentication) {
        return List.of();
    }

    @Override
    public List<SubmissionSummaryResponse> getTrackSubmissions(UUID trackId, Authentication authentication) {
        return List.of();
    }

    @Override
    public List<SubmissionSummaryResponse> getMentorTeamSubmissions(UUID teamId, Authentication authentication) {
        return List.of();
    }

    @Override
    public SubmissionDetailResponse getMentorSubmissionById(UUID submissionId, Authentication authentication) {
        return null;
    }

    // HELPER METHODS
    private Team getTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found."));
    }

    private Round getRound(UUID roundId) {
        return roundRepository.findById(roundId)
                .orElseThrow(() -> new NotFoundException("Round not found."));
    }

    private Submission getSubmission(UUID submissionId) {
        return submissionRepository.findDetailById(submissionId)
                .or(() -> submissionRepository.findById(submissionId))
                .orElseThrow(() -> new NotFoundException("Submission not found."));
    }

    private void ensureRoundBelongToTeamEvent(Team team, Round round) {
        if (team.getTrack() == null) {
            throw new BadRequestException("Team must register to a track before submitting deliverables.");
        }

        UUID trackEventId = team.getTrack().getEvent() == null ? null : team.getTrack().getEvent().getId();
        UUID roundEventId = round.getEvent() == null ? null : round.getEvent().getId();

        if (trackEventId == null || roundEventId == null || !trackEventId.equals(roundEventId)) {
            throw new BadRequestException("Round does not belong to the team's event.");
        }
    }

    private void ensureTeamCanSubmit(Team team) {
        if (team.getStatus() != TeamStatus.REGISTERED && team.getStatus() != TeamStatus.COMPETING) {
            throw new ConflictException("Team must be registered or competing before submitting deliverables.");
        }
    }

    private void ensureRoundCanAcceptSubmission(Round round) {
        if (round.getSubmissionLockedAt() != null) {
            throw new ConflictException("ROUND_SUBMISSION_LOCKED: This round's submissions are locked.");
        }
        if (round.getStatus() != RoundStatus.OPEN) {
            throw new ConflictException("Submissions are only allowed while the round is OPEN.");
        }
    }

    private void ensureTeamLeader(Team team, Authentication authentication) {
        UUID userId = CurrentUser.id(authentication);
        if (team.getLeader() == null || !team.getLeader().getId().equals(userId)) {
            throw new UnauthorizedException("Only the team leader can manage this submission.");
        }
    }

    private void validateRequiredLinks(Team team, List<SubmissionLinkRequest> links) {
        List<SubmissionLinkType> requiredTypes = team.getTrack() == null
                ? List.of() : team.getTrack().getRequiredLinkTypes();

        if (requiredTypes == null || requiredTypes.isEmpty()) {
            return;
        }

        Set<SubmissionLinkType> submitted = links.stream()
                .map(link -> parseLinkType(link.linkType()))
                .collect(Collectors.toSet());

        List<String> missing = requiredTypes.stream()
                .filter(type -> !submitted.contains(type))
                .map(Enum::name)
                .toList();

        if (!missing.isEmpty()) {
            throw new BadRequestException("Missing required link types: " +
                    String.join(", ", missing));
        }
    }

    private SubmissionLinkType parseLinkType(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Submission link type is required.");
        }
        try {
            return SubmissionLinkType.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported submission link type: " + value);
        }
    }
}
