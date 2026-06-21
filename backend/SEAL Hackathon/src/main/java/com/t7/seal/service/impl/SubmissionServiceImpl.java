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
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.RepositoryMetadataService;
import com.t7.seal.service.SubmissionFileStorageService;
import com.t7.seal.service.SubmissionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.time.Duration;
import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SubmissionServiceImpl implements SubmissionService {

    private static final int MAX_PAGE_SIZE = 100;

    private final SubmissionRepository submissionRepository;
    private final SubmissionLinkRepository submissionLinkRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final RepositoryMetadataService repositoryMetadataService;
    private final SubmissionFileStorageService submissionFileStorageService;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final NotificationService notificationService;

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
        boolean wasSubmittedBefore = existed && !submission.isDraft();
        submission.setNote(blankToNull(request.note()));
        if (existed && !submission.isDraft()) {
            submission.increaseSubmissionNumber();
        }

        markSubmittedConsideringDeadline(submission, round);

        Submission saved = submissionRepository.save(submission);
        replaceLinks(saved, request.links());
        saved = getSubmission(saved.getId());
        notifySubmissionChange(saved, wasSubmittedBefore);

        return toSubmissionResponse(saved);
    }

    @Override
    @Transactional
    public SubmissionResponse saveSubmissionDraft(
            UUID teamId,
            UUID roundId,
            UpdateSubmissionRequest request,
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

        if (request != null) {
            if (request.status() != null && parseSubmissionStatus(request.status()) != SubmissionStatus.DRAFT) {
                throw new BadRequestException("Draft endpoint only accepts DRAFT status.");
            }

            if (request.note() != null) {
                submission.setNote(blankToNull(request.note()));
            }

            if (request.links() != null) {
                replaceLinks(submissionRepository.save(submission), request.links());
            }
        }

        Submission saved = submissionRepository.save(submission);
        return toSubmissionResponse(getSubmission(saved.getId()));
    }

    @Override
    @Transactional
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
            boolean wasSubmittedBefore = !refreshed.isDraft();
            validateRequiredLinksFromEntity(refreshed);
            if (!refreshed.isDraft()) {
                refreshed.increaseSubmissionNumber();
            }
            markSubmittedConsideringDeadline(refreshed, refreshed.getRound());
            saved = submissionRepository.save(refreshed);
            notifySubmissionChange(saved, wasSubmittedBefore);
        }

        return toSubmissionResponse(getSubmission(saved.getId()));
    }

    @Override
    @Transactional
    public SubmissionResponse uploadFileToSubmission(
            UUID submissionId, String linkType,
            String label, Boolean isPrimary,
            Integer displayOrder, Boolean submitNow,
            MultipartFile file,
            Authentication authentication
    ) {
        Submission submission = getSubmission(submissionId);
        Team team = submission.getTeam();
        Round round = submission.getRound();

        ensureTeamLeader(team, authentication);
        ensureRoundCanAcceptSubmission(round);

        addUploadedFileLink(submission, parseLinkType(linkType),
                label, isPrimary, displayOrder, file);

        if (Boolean.TRUE.equals(submitNow)) {
            Submission refreshed = getSubmission(submissionId);
            boolean wasSubmittedBefore = !refreshed.isDraft();
            validateRequiredLinksFromEntity(refreshed);
            if (!refreshed.isDraft()) {
                refreshed.increaseSubmissionNumber();
            }
            markSubmittedConsideringDeadline(refreshed, refreshed.getRound());
            submissionRepository.save(refreshed);
            notifySubmissionChange(refreshed, wasSubmittedBefore);
        }

        return toSubmissionResponse(getSubmission(submissionId));
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionSummaryResponse> getTeamSubmissions(
            UUID teamId, Authentication authentication
    ) {
        Team team = getTeam(teamId);

        ensureTeamMemberOrCoordinatorOrMentor(team, authentication);

        return submissionRepository.findByTeamIdOrderByRoundOrderIndexAsc(teamId)
                .stream()
                .map(this::toSubmissionSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionById(
            UUID submissionId, Authentication authentication
    ) {
        Submission submission = getSubmission(submissionId);

        ensureCanViewSubmission(submission, authentication);

        return toSubmissionDetailResponse(submission);
    }

    @Override
    @Transactional(readOnly = true)
    public SubmissionDetailResponse getSubmissionForAdmin(
            UUID submissionId, Authentication authentication
    ) {
        ensureCoordinator(authentication);
        return toSubmissionDetailResponse(getSubmission(submissionId));
    }

    @Override
    @Transactional
    public SubmissionResponse updateSubmission(
            UUID submissionId,
            UpdateSubmissionRequest request,
            Authentication authentication
    ) {
        Submission submission = getSubmission(submissionId);
        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        boolean wasSubmittedBefore = !submission.isDraft();
        boolean notifySubmitOrUpdate = false;

        if (request.note() != null) {
            submission.setNote(blankToNull(request.note()));
        }

        if (request.links() != null) {
            if (request.links().isEmpty()) {
                throw new BadRequestException("At least one submission link is required.");
            }
            validateRequiredLinks(submission.getTeam(), request.links());
            replaceLinks(submission, request.links());
        }

        if (request.status() != null && !request.status().isBlank()) {
            SubmissionStatus status = parseSubmissionStatus(request.status());
            if (status == SubmissionStatus.SUBMITTED || status == SubmissionStatus.LATE) {
                validateRequiredLinksFromEntity(submission);
                submission.increaseSubmissionNumber();
                markSubmittedConsideringDeadline(submission, submission.getRound());
                notifySubmitOrUpdate = true;
            } else if (status == SubmissionStatus.DRAFT) {
                submission.setStatus(SubmissionStatus.DRAFT);
            } else {
                throw new BadRequestException("This submission status cannot be set from this endpoint.");
            }
        }

        Submission saved = submissionRepository.save(submission);
        if (notifySubmitOrUpdate) {
            notifySubmissionChange(saved, wasSubmittedBefore);
        }
        return toSubmissionResponse(getSubmission(saved.getId()));
    }

    @Transactional
    @Override
    public SubmissionResponse addSubmissionLinks(UUID submissionId, SubmissionLinkRequest request, Authentication authentication) {
        Submission submission = getSubmission(submissionId);

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());

        SubmissionLink link = toLinkEntity(submission, request);
        submissionLinkRepository.save(link);

        return toSubmissionResponse(getSubmission(submissionId));
    }

    @Transactional
    @Override
    public SubmissionLinkResponse updateSubmissionLink(UUID linkId, SubmissionLinkRequest request, Authentication authentication) {
        SubmissionLink link = submissionLinkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Submission link not found."));
        Submission submission = getSubmission(link.getSubmission().getId());

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());

        SubmissionLinkType parsedType = parseLinkType(request.linkType());
        link.setLinkType(parsedType);
        link.setUrl(request.url().trim());
        link.setLabel(blankToNull(request.label()));
        link.setIsPrimary(Boolean.TRUE.equals(request.isPrimary()));
        link.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        link.setStorageProvider(detectStorageProvider(parsedType, request.url()));
        link.setRepoMetadata(repositoryMetadataService.fetchMetadataIfRepository(parsedType, request.url()));

        if (link.getStorageProvider() != SubmissionStorageProvider.AWS_S3) {
            link.setObjectKey(null);
            link.setOriginalFileName(null);
            link.setContentType(null);
            link.setFileSizeBytes(null);
        }

        return toLinkResponse(submissionLinkRepository.save(link));
    }

    @Transactional
    @Override
    public void deleteSubmissionLink(UUID linkId, Authentication authentication) {
        SubmissionLink link = submissionLinkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Submission link not found."));
        Submission submission = getSubmission(link.getSubmission().getId());

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());

        submissionLinkRepository.delete(link);
    }

    @Transactional
    @Override
    public FileDownloadUrlResponse createSubmissionFileDownloadUrl(UUID linkId, Authentication authentication) {
        SubmissionLink link = submissionLinkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Submission link not found."));
        Submission submission = getSubmission(link.getSubmission().getId());

        ensureCanViewSubmission(submission, authentication);

        if (link.getStorageProvider() != SubmissionStorageProvider.AWS_S3) {
            throw new BadRequestException("This submission link is not an uploaded file.");
        }

        String url = submissionFileStorageService.createDownloadUrl(
                link.getObjectKey(), Duration.ofMinutes(10));

        return new FileDownloadUrlResponse(url, LocalDateTime.now().plusMinutes(10));
    }

    @Transactional
    @Override
    public SubmissionResponse submitExistingSubmission(UUID submissionId, Authentication authentication) {
        Submission submission = getSubmission(submissionId);

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        validateRequiredLinksFromEntity(submission);
        boolean wasSubmittedBefore = !submission.isDraft();

        if (!submission.isDraft()) {
            submission.increaseSubmissionNumber();
        }

        markSubmittedConsideringDeadline(submission, submission.getRound());

        Submission saved = submissionRepository.save(submission);
        notifySubmissionChange(saved, wasSubmittedBefore);
        return toSubmissionResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public PageResponse<CoordinatorSubmissionSummaryResponse> getEventSubmissions(
            UUID eventId, UUID roundId,
            UUID trackId, String status,
            String search,
            int page, int size,
            Authentication authentication
    ) {
        ensureCoordinator(authentication);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        SubmissionStatus parsedStatus = status == null || status.isBlank()
                ? null : parseSubmissionStatus(status);
        String keyword = search == null || search.isBlank()
                ? null : search.trim().toLowerCase(Locale.ROOT);

        Specification<Submission> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (eventId != null) {
                predicates.add(cb.equal(root.get("round").get("event").get("id"), eventId));
            }
            if (roundId != null) {
                predicates.add(cb.equal(root.get("round").get("id"), roundId));
            }
            if (trackId != null) {
                predicates.add(cb.equal(root.get("team").get("track").get("id"), trackId));
            }
            if (parsedStatus != null) {
                predicates.add(cb.equal(root.get("status"), parsedStatus));
            }
            if (keyword != null) {
                String pattern = "%" + keyword + "%";
                predicates.add(cb.or(
                        cb.like(cb.lower(root.get("team").get("name")), pattern),
                        cb.like(cb.lower(root.get("team").get("projectTitle")), pattern),
                        cb.like(cb.lower(root.get("round").get("name")), pattern)
                ));
            }
            return predicates.isEmpty()
                    ? cb.conjunction()
                    : cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<Submission> result = submissionRepository.findAll(spec, PageRequest.of(
                safePage,
                safeSize,
                Sort.by(Sort.Direction.DESC, "submittedAt")
        ));

        return new PageResponse<>(
                result.getContent()
                        .stream()
                        .map(this::toCoordinatorSummaryResponse)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionSummaryResponse> getRoundSubmissions(UUID roundId, Authentication authentication) {
        ensureCoordinator(authentication);
        return submissionRepository.findByRoundIdOrderBySubmittedAtDesc(roundId).stream()
                .map(this::toSubmissionSummaryResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<SubmissionSummaryResponse> getTrackSubmissions(UUID trackId, Authentication authentication) {
        ensureCoordinator(authentication);
        return submissionRepository.findByTrackIdOrderBySubmittedAtDesc(trackId)
                .stream()
                .map(this::toSubmissionSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public List<SubmissionSummaryResponse> getMentorTeamSubmissions(
            UUID teamId,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);

        ensureMentorAssignedToTeam(team, authentication);

        return submissionRepository.findByTeamIdOrderByRoundOrderIndexAsc(teamId)
                .stream()
                .map(this::toSubmissionSummaryResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    @Override
    public SubmissionDetailResponse getMentorSubmissionById(UUID submissionId, Authentication authentication) {
        Submission submission = getSubmission(submissionId);

        ensureMentorAssignedToTeam(submission.getTeam(), authentication);

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
        if (team.getStatus() != TeamStatus.REGISTERED
                && team.getStatus() != TeamStatus.COMPETING
                && team.getStatus() != TeamStatus.ADVANCED) {
            throw new ConflictException("Team must be registered, competing, or advanced before submitting deliverables.");
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

    private void ensureTeamMemberOrCoordinatorOrMentor(Team team, Authentication authentication) {
        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }
        UUID userId = CurrentUser.id(authentication);
        if (teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), userId)) {
            return;
        }
        if (isMentorAssignedToTeam(team, userId)) {
            return;
        }
        throw new UnauthorizedException("You do not have access to this team's submissions.");
    }

    private void ensureCanViewSubmission(Submission submission, Authentication authentication) {
        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }
        UUID userId = CurrentUser.id(authentication);
        Team team = submission.getTeam();
        if (teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), userId)) {
            return;
        }
        if (isMentorAssignedToTeam(team, userId)) {
            return;
        }
        if (isJudgeAssignedToSubmission(submission, userId)) {
            return;
        }
        throw new UnauthorizedException("You do not have access to this submission.");
    }

    private void ensureMentorAssignedToTeam(Team team, Authentication authentication) {
        UUID currentUserId = CurrentUser.id(authentication);

        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }

        if (!isMentorAssignedToTeam(team, currentUserId)) {
            throw new UnauthorizedException("Mentor is not assigned to this team's track.");
        }
    }

    private boolean isMentorAssignedToTeam(Team team, UUID userId) {
        return team.getTrack() != null && mentorAssignmentRepository
                .existsByTrackIdAndUserId(team.getTrack().getId(), userId);
    }

    private boolean isJudgeAssignedToSubmission(Submission submission, UUID userId) {
        return roundJudgeAssignmentRepository.findByRoundIdWithJudgeAndTrack(submission.getRound().getId())
                .stream()
                .filter(a -> a.getJudge() != null && a.getJudge().getUser() != null)
                .filter(a -> canJudgeStillScore(a.getJudge()))
                .filter(a -> a.getJudge().getUser().getId().equals(userId))
                .anyMatch(a -> a.canScore(
                        submission.getRound().getId(),
                        submission.getTeam().getTrack() == null ? null : submission.getTeam().getTrack().getId()
                ));
    }

    private boolean canJudgeStillScore(Judge judge) {
        User user = judge.getUser();

        if (user == null || !user.isActive()) {
            return false;
        }

        return !Boolean.TRUE.equals(judge.getIsTemporary())
                || judge.isTemporaryActive(LocalDateTime.now());
    }

    private void ensureCoordinator(Authentication authentication) {
        if (!CurrentUser.isAdminOrCoordinator(authentication)) {
            throw new UnauthorizedException("Only coordinator or admin can access submission management.");
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

    private SubmissionStatus parseSubmissionStatus(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Submission status is required.");
        }
        try {
            return SubmissionStatus.valueOf(value.trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Unsupported submission status: " + value);
        }
    }

    private void notifySubmissionChange(Submission submission, boolean wasSubmittedBefore) {
        Team team = submission.getTeam();
        Round round = submission.getRound();
        if (team == null || round == null || team.getLeader() == null) {
            return;
        }

        NotificationType type = wasSubmittedBefore
                ? NotificationType.SUBMISSION_UPDATED
                : NotificationType.SUBMISSION_SUBMITTED;
        String action = wasSubmittedBefore ? "updated" : "submitted";
        String roundName = round.getName() == null ? "current round" : round.getName();
        String teamName = team.getName() == null ? "Team" : team.getName();
        String title = wasSubmittedBefore ? "Submission updated" : "Submission submitted";
        String body = teamName + " " + action + " deliverables for " + roundName
                + " (submission #" + submission.getSubmissionNumber() + ").";

        try {
            notificationService.createSystemNotification(
                    team.getLeader(),
                    round.getEvent(),
                    type,
                    title,
                    body,
                    NotificationTargetScope.TEAM,
                    team.getId(),
                    null,
                    NotificationChannel.BOTH,
                    null
            );

            if (team.getTrack() != null) {
                for (User mentor : mentorAssignmentRepository.findActiveMentorsByTrackId(team.getTrack().getId())) {
                    notificationService.createSystemNotification(
                            team.getLeader(),
                            round.getEvent(),
                            type,
                            title,
                            body,
                            NotificationTargetScope.SINGLE_USER,
                            mentor.getId(),
                            "MENTOR",
                            NotificationChannel.IN_APP,
                            null
                    );
                }
            }

            notificationService.createSystemNotification(
                    team.getLeader(),
                    round.getEvent(),
                    type,
                    title,
                    body,
                    NotificationTargetScope.EVENT_COORDINATORS,
                    null,
                    null,
                    NotificationChannel.IN_APP,
                    null
            );
        } catch (RuntimeException ignored) {
            // Submission persistence must not roll back because notification delivery failed.
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
                submission.getRound().isSubmissionLocked(),
                submission.getRound().getSubmissionLockedAt(),
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
                submission.getRound().isSubmissionLocked(),
                submission.getRound().getSubmissionLockedAt(),
                links.size()
        );
    }

    private CoordinatorSubmissionSummaryResponse toCoordinatorSummaryResponse(Submission submission) {
        HackathonEvent event = submission.getRound().getEvent();

        List<SubmissionLink> links = submissionLinkRepository.findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(submission.getId());

        return new CoordinatorSubmissionSummaryResponse(
                submission.getId(),
                event == null ? null : event.getId(),
                event == null ? null : event.getName(),
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
                submission.getRound().isSubmissionLocked(),
                submission.getRound().getSubmissionLockedAt(),
                links.size(),
                submission.isLate()
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
                link.getStorageProvider() == null
                        ? SubmissionStorageProvider.EXTERNAL_URL.name()
                        : link.getStorageProvider().name(),
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
