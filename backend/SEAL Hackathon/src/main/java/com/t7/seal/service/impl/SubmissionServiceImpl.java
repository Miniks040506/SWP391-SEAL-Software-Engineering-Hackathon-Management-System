package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.dto.UploadedSubmissionFile;
import com.t7.seal.entities.*;
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
import com.t7.seal.service.RepositoryMetadataService;
import com.t7.seal.service.SubmissionFileStorageService;
import com.t7.seal.service.SubmissionService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
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
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final RepositoryMetadataService repositoryMetadataService;
    private final SubmissionFileStorageService submissionFileStorageService;

    @Override
    @Transactional
    public SubmissionResponse submitDeliverables(
            UUID teamId, UUID roundId,
            SubmitDeliverablesRequest request,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);
        Round round = getRound(roundId);

        ensureRoundBelongsToTeamEvent(team, round);
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

        boolean existed = submission.getId() != null;
        submission.setNote(blankToNull(request.note()));
        if (existed && !submission.isDraft()) {
            submission.increaseSubmissionNumber();
        }

        markSubmittedConsideringDeadline(submission, round);

        Submission saved = submissionRepository.save(submission);
        replaceLinks(saved, request.links());
        saved = getSubmission(saved.getId());

        return toSubmissionResponse(saved);
    }

    @Override
    public SubmissionResponse uploadSubmissionFile(
            UUID teamId, UUID roundId,
            String linkType, String note,
            String label, Boolean isPrimary,
            Integer displayOrder,
            Boolean submitNow,
            MultipartFile file,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);
        Round round = getRound(roundId);

        ensureRoundBelongsToTeamEvent(team, round);
        ensureTeamLeader(team, authentication);
        ensureTeamCanSubmit(team);
        ensureRoundCanAcceptSubmission(round);

        Submission submission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .orElseGet(() -> Submission.builder()
                        .team(team)
                        .round(round)
                        .status(SubmissionStatus.DRAFT)
                        .submissionNumber(1)
                        .submissionLinks(new ArrayList<>())
                        .build());

        if (note != null) {
            submission.setNote(blankToNull(note));
        }

        Submission saved = submissionRepository.save(submission);

        //Add upload file link
        addUploadedFileLink(saved, parseLinkType(linkType),
                label, isPrimary, displayOrder, file);

        if (Boolean.TRUE.equals(submitNow)) {
            Submission refreshed = getSubmission(saved.getId());
            validateRequiredLinksFromEntity(refreshed);
            if (!refreshed.isDraft()) {
                refreshed.increaseSubmissionNumber();
            }
            markSubmittedConsideringDeadline(refreshed, refreshed.getRound());
            saved = submissionRepository.save(refreshed);
        }

        return toSubmissionResponse(getSubmission(saved.getId()));
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

    @Transactional(readOnly = true)
    @Override
    public List<SubmissionSummaryResponse> getMentorTeamSubmissions(
            UUID teamId,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);

        ensureMentorAssignToTeam(team, authentication);

        return submissionRepository.findByTeamIdOrderByRoundOrderIndexAsc(teamId)
                .stream()
                .map(this::toSubmissionSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public SubmissionDetailResponse getMentorSubmissionById(UUID submissionId, Authentication authentication) {
        Submission submission = getSubmission(submissionId);

        ensureMentorAssignToTeam(submission.getTeam(), authentication);

        return toSubmissionDetailResponse(submission);
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

    private void ensureRoundBelongsToTeamEvent(Team team, Round round) {
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

    private void ensureMentorAssignToTeam(Team team, Authentication authentication) {
        UUID currentUserId = CurrentUser.id(authentication);

        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }

        if (!isMentorAssignToTeam(team, CurrentUser.id(authentication))) {
            throw new UnauthorizedException("Mentor is not assigned to this team's track.");
        }
    }

    private boolean isMentorAssignToTeam(Team team, UUID userId) {
        return team.getTrack() != null && mentorAssignmentRepository
                .existsByTrackIdAndUserId(team.getTrack().getId(), userId);
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

    private void validateRequiredLinksFromEntity(Submission submission) {
        List<SubmissionLink> links = submissionLinkRepository
                .findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(submission.getId());

        List<SubmissionLinkRequest> requests = links.stream()
                .map(link -> new SubmissionLinkRequest(
                        link.getLinkType().name(), link.getUrl(),
                        link.getLabel(), link.getIsPrimary(),
                        link.getDisplayOrder()
                )).toList();

        validateRequiredLinks(submission.getTeam(), requests);
    }

    private void replaceLinks(Submission submission, List<SubmissionLinkRequest> links) {
        submissionLinkRepository.deleteBySubmissionId(submission.getId());
        List<SubmissionLink> entities = links.stream()
                .map(link -> toLinkEntity(submission, link))
                .toList();
        submissionLinkRepository.saveAll(entities);
    }

    private SubmissionLink toLinkEntity(Submission submission, SubmissionLinkRequest request) {
        SubmissionLinkType parsedType = parseLinkType(request.linkType());
        String trimmedUrl = request.url().trim();
        return SubmissionLink.builder()
                .submission(submission)
                .linkType(parsedType)
                .url(trimmedUrl)
                .label(blankToNull(request.label()))
                .storageProvider(detectStorageProvider(parsedType, trimmedUrl))
                .repoMetadata(repositoryMetadataService.fetchMetadataIfRepository(parsedType, trimmedUrl))
                .isPrimary(Boolean.TRUE.equals(request.isPrimary()))
                .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                .build();
    }

    private void addUploadedFileLink(
            Submission submission,
            SubmissionLinkType linkType,
            String label, Boolean isPrimary,
            Integer displayOrder, MultipartFile file
    ) {
        UUID eventId = submission.getRound().getEvent() == null
                ? null : submission.getRound().getEvent().getId();

        UploadedSubmissionFile uploaded = submissionFileStorageService.uploadSubmissionFile(
                eventId,
                submission.getTeam().getId(),
                submission.getRound().getId(),
                file
        );

        SubmissionLink link = SubmissionLink.builder()
                .submission(submission)
                .linkType(linkType)
                .url(uploaded.url())
                .label(blankToNull(label))
                .storageProvider(SubmissionStorageProvider.AWS_S3)
                .objectKey(uploaded.objectKey())
                .originalFileName(uploaded.originalFileName())
                .contentType(uploaded.contentType())
                .fileSizeBytes(uploaded.fileSizeBytes())
                .isPrimary(Boolean.TRUE.equals(isPrimary))
                .displayOrder(displayOrder == null ? 0 : displayOrder)
                .build();

        submissionLinkRepository.save(link);
    }


    private SubmissionStorageProvider detectStorageProvider(SubmissionLinkType linkType, String url) {
        if (url == null) {
            return SubmissionStorageProvider.EXTERNAL_URL;
        }
        String lower = url.toLowerCase(Locale.ROOT);
        if (lower.contains("drive.google.com") || lower.contains("docs.google.com")) {
            return SubmissionStorageProvider.GOOGLE_DRIVE;
        }
        if (linkType == SubmissionLinkType.REPOSITORY && lower.contains("github.com")) {
            return SubmissionStorageProvider.GITHUB;
        }
        if (linkType == SubmissionLinkType.REPOSITORY && lower.contains("gitlab")) {
            return SubmissionStorageProvider.GITLAB;
        }
        return SubmissionStorageProvider.EXTERNAL_URL;
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

    private void markSubmittedConsideringDeadline(Submission submission, Round round) {
        boolean late = round.getSubmissionDeadline() != null
                && LocalDateTime.now().isAfter(round.getSubmissionDeadline());
        if (late) {
            submission.markLate();
        } else {
            submission.markSubmitted();
        }
    }

    private SubmissionResponse toSubmissionResponse(Submission submission) {
        return new SubmissionResponse(
                submission.getId(),
                submission.getTeam().getId(),
                submission.getTeam().getName(),
                submission.getTeam().getTrack() == null ? null : submission.getTeam().getTrack().getId(),
                submission.getTeam().getTrack() == null ? null : submission.getTeam().getTrack().getName(),
                submission.getRound().getId(),
                submission.getRound().getName(),
                submission.getNote(),
                submission.getStatus().name(),
                submission.getSubmissionNumber(),
                submission.getSubmittedAt(),
                submission.getUpdatedAt(),
                linkResponses(submission.getId())
        );
    }

    private SubmissionSummaryResponse toSubmissionSummaryResponse(Submission submission) {
        List<SubmissionLink> links = submissionLinkRepository.findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(submission.getId());

        return new SubmissionSummaryResponse(
                submission.getId(),
                submission.getTeam().getId(),
                submission.getTeam().getName(),
                submission.getTeam().getTrack() == null ? null : submission.getTeam().getTrack().getId(),
                submission.getTeam().getTrack() == null ? null : submission.getTeam().getTrack().getName(),
                submission.getRound().getId(),
                submission.getRound().getName(),
                submission.getStatus().name(),
                submission.getSubmissionNumber(),
                submission.getSubmittedAt(),
                submission.getUpdatedAt(),
                links.size()
        );
    }

    private SubmissionDetailResponse toSubmissionDetailResponse(Submission submission) {
        Round round = submission.getRound();
        Team team = submission.getTeam();
        HackathonEvent event = round.getEvent();
        Track track = team.getTrack();
        User leader = team.getLeader();

        return new SubmissionDetailResponse(
                submission.getId(),
                event == null ? null : event.getId(),
                event == null ? null : event.getName(),
                team.getId(),
                team.getName(),
                leader == null ? null : leader.getId(),
                leader == null ? null : leader.getFullName(),
                track == null ? null : track.getId(),
                track == null ? null : track.getName(),
                round.getId(),
                round.getName(),
                submission.getNote(),
                submission.getStatus().name(),
                submission.getSubmissionNumber(),
                submission.getSubmittedAt(),
                submission.getUpdatedAt(),
                round.isSubmissionLocked(),
                round.getSubmissionLockedAt(),
                linkResponses(submission.getId())
        );
    }

    private List<SubmissionLinkResponse> linkResponses(UUID submissionId) {
        return submissionLinkRepository.findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(submissionId)
                .stream()
                .map(this::toLinkResponse)
                .toList();
    }

    private SubmissionLinkResponse toLinkResponse(SubmissionLink link) {
        return new SubmissionLinkResponse(
                link.getId(),
                link.getLinkType().name(),
                link.getUrl(),
                link.getDisplayLabel(),
                link.getStorageProvider() == null ? SubmissionStorageProvider.EXTERNAL_URL.name() : link.getStorageProvider().name(),
                link.getObjectKey(),
                link.getOriginalFileName(),
                link.getContentType(),
                link.getFileSizeBytes(),
                link.getRepoMetadata(),
                link.getIsPrimary(),
                link.getDisplayOrder(),
                link.getCreatedAt(),
                link.getUpdatedAt()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
