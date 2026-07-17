package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.dto.UploadedSubmissionFile;
import com.t7.seal.dto.RepositoryMetadata;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.exception.SubmissionUploadException;
import com.t7.seal.repository.*;
import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.ImportGoogleDriveFileRequest;
import com.t7.seal.request.submission.SelectGithubRepositoryRequest;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.request.submission.UpdateSubmissionLinkMetadataRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.submission.*;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.NotificationService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.GoogleDriveConnectionService;
import com.t7.seal.service.GithubConnectionService;
import com.t7.seal.service.RepositoryMetadataService;
import com.t7.seal.service.SubmissionFileStorageService;
import com.t7.seal.service.SubmissionAttemptSnapshotService;
import com.t7.seal.service.SubmissionMutationPolicy;
import com.t7.seal.service.SubmissionRequirementCatalog;
import com.t7.seal.service.SubmissionService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.net.URI;
import java.net.URISyntaxException;
import java.io.IOException;
import java.io.InputStream;
import java.time.Duration;
import java.time.LocalDateTime;
import java.time.ZoneOffset;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class SubmissionServiceImpl implements SubmissionService {

    private static final int MAX_PAGE_SIZE = 100;
    private static final Set<SubmissionStatus> MENTOR_VISIBLE_STATUSES = EnumSet.of(
            SubmissionStatus.SUBMITTED,
            SubmissionStatus.LATE,
            SubmissionStatus.DISQUALIFIED
    );

    private final SubmissionRepository submissionRepository;
    private final SubmissionLinkRepository submissionLinkRepository;
    private final SubmissionAttemptRepository submissionAttemptRepository;
    private final SubmissionAttemptLinkRepository submissionAttemptLinkRepository;
    private final TeamMemberRepository teamMemberRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final MentorAssignmentRepository mentorAssignmentRepository;
    private final RepositoryMetadataService repositoryMetadataService;
    private final SubmissionFileStorageService submissionFileStorageService;
    private final GoogleDriveConnectionService googleDriveConnectionService;
    private final GithubConnectionService githubConnectionService;
    private final CurrentUserService currentUserService;
    private final RoundJudgeAssignmentRepository roundJudgeAssignmentRepository;
    private final NotificationService notificationService;
    private final SubmissionRequirementCatalog requirementCatalog;
    private final SubmissionMutationPolicy mutationPolicy;
    private final SubmissionAttemptSnapshotService attemptSnapshotService;

    @Override
    @Transactional(readOnly = true)
    public SubmissionRequirementsResponse getSubmissionRequirements(
            UUID teamId,
            UUID roundId,
            Authentication authentication
    ) {
        Team team = getTeam(teamId);
        Round round = getRound(roundId);
        Optional<Submission> currentSubmission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId);

        if (team.getTrack() != null) {
            ensureRoundBelongsToTeamEvent(team, round);
        }
        ensureCanViewRequirements(team, currentSubmission.orElse(null), authentication);

        List<SubmissionLink> currentLinks = currentSubmission
                .map(submission -> submissionLinkRepository
                        .findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(submission.getId()))
                .orElseGet(List::of);
        List<SubmissionLinkType> requiredTypes = team.getTrack() == null
                || team.getTrack().getRequiredLinkTypes() == null
                ? List.of()
                : team.getTrack().getRequiredLinkTypes();
        SubmissionRequirementCatalog.Evaluation requirements = requirementCatalog.evaluate(
                requiredTypes,
                currentLinks
        );
        SubmissionMutationPolicy.Evaluation permissions = mutationPolicy.evaluate(
                team,
                round,
                CurrentUser.id(authentication),
                requirements.missingRequiredTypes(),
                LocalDateTime.now()
        );
        if (currentSubmission.map(Submission::isScorable).orElse(false)
                && permissions.canEdit()) {
            permissions = new SubmissionMutationPolicy.Evaluation(
                    false,
                    false,
                    SubmissionBlockedReason.SUBMISSION_RESUBMISSION_REQUIRED,
                    "Begin a resubmission before changing finalized evidence."
            );
        }

        HackathonEvent event = round.getEvent();
        Track track = team.getTrack();

        return new SubmissionRequirementsResponse(
                event == null ? null : event.getId(),
                event == null ? null : event.getName(),
                track == null ? null : track.getId(),
                track == null ? null : track.getName(),
                team.getId(),
                team.getName(),
                round.getId(),
                round.getName(),
                round.getDescription(),
                round.getStatus().name(),
                round.getSubmissionDeadline(),
                round.isSubmissionLocked(),
                round.getSubmissionLockedAt(),
                true,
                permissions.canEdit(),
                permissions.canSubmit(),
                permissions.blockedReason().name(),
                permissions.blockedMessage(),
                requirements.requirements(),
                requirementCatalog.uploadPolicy(),
                requirementCatalog.providerAvailability(),
                currentSubmission.map(this::toSubmissionResponse).orElse(null),
                requirements.satisfiedTypes(),
                requirements.missingRequiredTypes()
        );
    }

    @Override
    @Transactional
    public SubmissionResponse submitDeliverables(
            UUID teamId, UUID roundId,
            SubmitDeliverablesRequest request,
            Authentication authentication
    ) {
        Team team = getTeamForSubmissionMutation(teamId);
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

        ensureDraftSubmission(submission);
        submission.setNote(blankToNull(request.note()));

        markSubmittedBeforeDeadline(submission, round);

        Submission saved = submissionRepository.save(submission);
        replaceLinks(saved, request.links());
        saved = getSubmission(saved.getId());
        attemptSnapshotService.createSnapshot(saved);
        notifySubmissionChange(saved, false);

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
        Team team = getTeamForSubmissionMutation(teamId);
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
        ensureDraftSubmission(submission);

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
        Team team = getTeamForSubmissionMutation(teamId);
        Round round = getRound(roundId);

        ensureRoundBelongsToTeamEvent(team, round);
        ensureTeamLeader(team, authentication);
        ensureTeamCanSubmit(team);
        ensureRoundCanAcceptSubmission(round);
        if (Boolean.TRUE.equals(submitNow)) {
            throw new BadRequestException("Upload the file first, then use the submission finalize endpoint.");
        }

        Submission submission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .orElseGet(() -> Submission.builder()
                        .team(team)
                        .round(round)
                        .status(SubmissionStatus.DRAFT)
                        .submissionNumber(1)
                        .submissionLinks(new ArrayList<>())
                        .build());
        ensureDraftSubmission(submission);

        if (note != null) {
            submission.setNote(blankToNull(note));
        }

        Submission saved = submissionRepository.save(submission);

        //Add upload file link
        addUploadedFileLink(saved, parseLinkType(linkType),
                label, isPrimary, displayOrder, file);

        return toSubmissionResponse(getSubmission(saved.getId()));
    }

    @Override
    @Transactional
    public SubmissionResponse importGoogleDriveFile(
            UUID teamId,
            UUID roundId,
            ImportGoogleDriveFileRequest request,
            Authentication authentication
    ) {
        Team team = getTeamForSubmissionMutation(teamId);
        Round round = getRound(roundId);

        ensureRoundBelongsToTeamEvent(team, round);
        ensureTeamLeader(team, authentication);
        ensureTeamCanSubmit(team);
        ensureRoundCanAcceptSubmission(round);

        SubmissionLinkType linkType = parseLinkType(request.linkType());
        if (!requirementCatalog.supportsSource(
                linkType,
                SubmissionInputSource.GOOGLE_DRIVE
        )) {
            throw new BadRequestException(
                    "Google Drive is not allowed for submission type " + linkType + "."
            );
        }

        Submission submission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .orElseGet(() -> Submission.builder()
                        .team(team)
                        .round(round)
                        .status(SubmissionStatus.DRAFT)
                        .submissionNumber(1)
                        .submissionLinks(new ArrayList<>())
                        .build());
        ensureDraftSubmission(submission);
        Submission savedSubmission = submissionRepository.save(submission);
        ensureAdditionalFileAllowed(savedSubmission);

        GoogleDriveConnectionService.SelectedDriveFile selected =
                googleDriveConnectionService.openSelectedFile(
                        currentUserService.getCurrentUser(authentication),
                        request.fileId()
                );
        UploadedSubmissionFile uploaded = null;
        try (InputStream content = selected.content()) {
            UUID eventId = round.getEvent() == null ? null : round.getEvent().getId();
            uploaded = submissionFileStorageService.uploadSubmissionFile(
                    eventId,
                    teamId,
                    roundId,
                    selected.name(),
                    selected.mimeType(),
                    selected.sizeBytes(),
                    content
            );

            String label = blankToNull(request.label());
            if (label == null) {
                label = selected.name().length() > 200
                        ? selected.name().substring(0, 200)
                        : selected.name();
            }
            SubmissionLink link = SubmissionLink.builder()
                    .submission(savedSubmission)
                    .linkType(linkType)
                    .url(selected.viewUri().toString())
                    .label(label)
                    .storageProvider(SubmissionStorageProvider.GOOGLE_DRIVE)
                    .objectKey(uploaded.objectKey())
                    .originalFileName(uploaded.originalFileName())
                    .contentType(uploaded.contentType())
                    .fileSizeBytes(uploaded.fileSizeBytes())
                    .providerResourceId(selected.fileId())
                    .providerChecksum(selected.checksum())
                    .providerModifiedAt(selected.modifiedAt() == null
                            ? null
                            : LocalDateTime.ofInstant(selected.modifiedAt(), ZoneOffset.UTC))
                    .isPrimary(Boolean.TRUE.equals(request.isPrimary()))
                    .displayOrder(request.displayOrder() == null ? 0 : request.displayOrder())
                    .build();
            submissionLinkRepository.save(link);
        } catch (IOException | RuntimeException exception) {
            deleteFailedSnapshot(uploaded);
            if (exception instanceof RuntimeException runtimeException) {
                throw runtimeException;
            }
            throw SubmissionUploadException.conflict(
                    "GOOGLE_DRIVE_FILE_READ_FAILED",
                    "The selected Google Drive file could not be read. Choose it again and retry."
            );
        }

        return toSubmissionResponse(getSubmission(savedSubmission.getId()));
    }

    @Override
    @Transactional
    public SubmissionResponse selectGithubRepository(
            UUID teamId,
            UUID roundId,
            SelectGithubRepositoryRequest request,
            Authentication authentication
    ) {
        Team team = getTeamForSubmissionMutation(teamId);
        Round round = getRound(roundId);
        ensureRoundBelongsToTeamEvent(team, round);
        ensureTeamLeader(team, authentication);
        ensureTeamCanSubmit(team);
        ensureRoundCanAcceptSubmission(round);
        if (!requirementCatalog.supportsSource(
                SubmissionLinkType.REPOSITORY, SubmissionInputSource.GITHUB
        )) {
            throw new BadRequestException("GitHub is not allowed for repository evidence.");
        }

        Submission submission = submissionRepository.findByTeamIdAndRoundId(teamId, roundId)
                .orElseGet(() -> Submission.builder()
                        .team(team)
                        .round(round)
                        .status(SubmissionStatus.DRAFT)
                        .submissionNumber(1)
                        .submissionLinks(new ArrayList<>())
                        .build());
        ensureDraftSubmission(submission);
        Submission savedSubmission = submissionRepository.save(submission);

        var snapshot = githubConnectionService.snapshot(
                currentUserService.getCurrentUser(authentication),
                request.owner(), request.repository(), request.reference()
        );
        var repository = snapshot.repository();
        LocalDateTime synchronizedAt = LocalDateTime.ofInstant(
                snapshot.synchronizedAt(), ZoneOffset.UTC
        );
        RepositoryMetadata metadata = RepositoryMetadata.builder()
                .platform("GITHUB")
                .repoName(repository.fullName())
                .owner(repository.owner())
                .repository(repository.name())
                .selectedReference(snapshot.selectedReference())
                .referenceType(request.referenceType().toUpperCase(Locale.ROOT))
                .commitSha(snapshot.commitSha())
                .commitUrl(snapshot.commitUri().toString())
                .defaultBranch(repository.defaultBranch())
                .visibility(repository.visibility())
                .primaryLanguage(repository.primaryLanguage())
                .lastPushAt(toUtc(repository.pushedAt()))
                .committedAt(toUtc(snapshot.committedAt()))
                .lastSynchronizedAt(synchronizedAt)
                .isPrivate(repository.privateRepository())
                .build();

        List<SubmissionLink> links = submissionLinkRepository
                .findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(savedSubmission.getId());
        SubmissionLink link = links.stream()
                .filter(this::isManagedGithubSnapshot)
                .findFirst()
                .orElseGet(() -> SubmissionLink.builder()
                        .submission(savedSubmission)
                        .linkType(SubmissionLinkType.REPOSITORY)
                        .build());
        link.setUrl(repository.htmlUri().toString());
        link.setLabel(Optional.ofNullable(blankToNull(request.label()))
                .orElse(repository.fullName()));
        link.setStorageProvider(SubmissionStorageProvider.GITHUB);
        link.setProviderResourceId(repository.fullName());
        link.setProviderChecksum(snapshot.commitSha());
        link.setProviderModifiedAt(synchronizedAt);
        link.setRepoMetadata(metadata);
        link.setIsPrimary(request.isPrimary() == null || request.isPrimary());
        link.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        submissionLinkRepository.save(link);

        return toSubmissionResponse(getSubmission(savedSubmission.getId()));
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
        Submission submission = getSubmissionForUpdate(submissionId);
        Team team = submission.getTeam();
        Round round = submission.getRound();

        ensureTeamLeader(team, authentication);
        ensureRoundCanAcceptSubmission(round);
        ensureDraftSubmission(submission);
        if (Boolean.TRUE.equals(submitNow)) {
            throw new BadRequestException("Upload the file first, then use the submission finalize endpoint.");
        }

        addUploadedFileLink(submission, parseLinkType(linkType),
                label, isPrimary, displayOrder, file);

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
                .filter(submission -> MENTOR_VISIBLE_STATUSES.contains(submission.getStatus()))
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
    public List<SubmissionAttemptResponse> getSubmissionAttempts(
            UUID submissionId,
            Authentication authentication
    ) {
        Submission submission = getSubmission(submissionId);
        ensureCanViewSubmission(submission, authentication);

        return submissionAttemptRepository
                .findBySubmissionIdOrderByAttemptNumberDesc(submissionId)
                .stream()
                .map(this::toSubmissionAttemptResponse)
                .toList();
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
        Submission submission = getSubmissionForUpdate(submissionId);
        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        ensureDraftSubmission(submission);

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
            if (status != SubmissionStatus.DRAFT) {
                throw new BadRequestException("Use the submission finalize endpoint to submit a draft.");
            }
        }

        Submission saved = submissionRepository.save(submission);
        return toSubmissionResponse(getSubmission(saved.getId()));
    }

    @Transactional
    @Override
    public SubmissionResponse addSubmissionLinks(UUID submissionId, SubmissionLinkRequest request, Authentication authentication) {
        Submission submission = getSubmissionForUpdate(submissionId);

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        ensureDraftSubmission(submission);

        SubmissionLink link = toLinkEntity(submission, request);
        submissionLinkRepository.save(link);

        return toSubmissionResponse(getSubmission(submissionId));
    }

    @Transactional
    @Override
    public SubmissionLinkResponse updateSubmissionLink(UUID linkId, SubmissionLinkRequest request, Authentication authentication) {
        SubmissionLink link = submissionLinkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Submission link not found."));
        Submission submission = getSubmissionForUpdate(link.getSubmission().getId());

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        ensureDraftSubmission(submission);

        SubmissionLinkType parsedType = parseLinkType(request.linkType());
        String normalizedUrl = normalizeHttpUrl(request.url());
        link.setLinkType(parsedType);
        link.setUrl(normalizedUrl);
        link.setLabel(blankToNull(request.label()));
        link.setIsPrimary(Boolean.TRUE.equals(request.isPrimary()));
        link.setDisplayOrder(request.displayOrder() == null ? 0 : request.displayOrder());
        link.setStorageProvider(detectStorageProvider(parsedType, normalizedUrl));
        link.setRepoMetadata(repositoryMetadataService.fetchMetadataIfRepository(parsedType, normalizedUrl));

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
    public SubmissionLinkResponse updateSubmissionLinkMetadata(
            UUID linkId,
            UpdateSubmissionLinkMetadataRequest request,
            Authentication authentication
    ) {
        SubmissionLink link = submissionLinkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Submission link not found."));
        Submission submission = getSubmissionForUpdate(link.getSubmission().getId());

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        ensureDraftSubmission(submission);

        if (request.linkType() == null && request.label() == null
                && request.isPrimary() == null && request.displayOrder() == null) {
            throw new BadRequestException("At least one evidence metadata field is required.");
        }

        SubmissionLinkType updatedType = request.linkType() == null
                ? link.getLinkType() : parseLinkType(request.linkType());
        String updatedLabel = request.label() == null
                ? link.getLabel() : blankToNull(request.label());
        if (updatedType == SubmissionLinkType.OTHER && updatedLabel == null) {
            throw new BadRequestException("A label is required for OTHER submission evidence.");
        }

        link.setLinkType(updatedType);
        link.setLabel(updatedLabel);
        if (request.isPrimary() != null) {
            link.setIsPrimary(request.isPrimary());
        }
        if (request.displayOrder() != null) {
            link.setDisplayOrder(request.displayOrder());
        }

        return toLinkResponse(submissionLinkRepository.save(link));
    }

    @Transactional
    @Override
    public void deleteSubmissionLink(UUID linkId, Authentication authentication) {
        SubmissionLink link = submissionLinkRepository.findById(linkId)
                .orElseThrow(() -> new NotFoundException("Submission link not found."));
        Submission submission = getSubmissionForUpdate(link.getSubmission().getId());

        ensureTeamLeader(submission.getTeam(), authentication);
        ensureRoundCanAcceptSubmission(submission.getRound());
        ensureDraftSubmission(submission);

        submissionLinkRepository.delete(link);
        submissionLinkRepository.flush();

        boolean retainedByAttempt = link.getObjectKey() != null
                && submissionAttemptLinkRepository.existsByObjectKey(link.getObjectKey());
        if (link.getStorageProvider() == SubmissionStorageProvider.AWS_S3 && !retainedByAttempt) {
            submissionFileStorageService.deleteSubmissionFile(link.getObjectKey());
        }
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

    @Transactional(readOnly = true)
    @Override
    public FileDownloadUrlResponse createSubmissionAttemptFileDownloadUrl(
            UUID submissionId,
            UUID evidenceId,
            Authentication authentication
    ) {
        Submission submission = getSubmission(submissionId);
        ensureCanViewSubmission(submission, authentication);

        SubmissionAttemptLink evidence = submissionAttemptLinkRepository.findById(evidenceId)
                .filter(link -> submissionId.equals(link.getAttempt().getSubmission().getId()))
                .orElseThrow(() -> new NotFoundException("Submission attempt evidence not found."));

        if (evidence.getStorageProvider() != SubmissionStorageProvider.AWS_S3) {
            throw new BadRequestException("This attempt evidence is not an uploaded file.");
        }
        if (evidence.getObjectKey() == null || evidence.getObjectKey().isBlank()) {
            throw new BadRequestException("Submission attempt file object key is missing.");
        }

        String url = submissionFileStorageService.createDownloadUrl(
                evidence.getObjectKey(), Duration.ofMinutes(10));
        return new FileDownloadUrlResponse(url, LocalDateTime.now().plusMinutes(10));
    }

    @Transactional
    @Override
    public SubmissionResponse submitExistingSubmission(UUID submissionId, Authentication authentication) {
        Submission submission = submissionRepository.findByIdForUpdate(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found."));

        ensureTeamLeader(submission.getTeam(), authentication);

        if (submission.isScorable()) {
            attemptSnapshotService.createSnapshot(submission);
            return toSubmissionResponse(submission);
        }

        if (!submission.isDraft()) {
            throw new ConflictException(
                    "SUBMISSION_NOT_EDITABLE: Only a draft submission can be finalized.");
        }

        ensureRoundCanAcceptSubmission(submission.getRound());
        validateRequiredLinksFromEntity(submission);

        markSubmittedBeforeDeadline(submission, submission.getRound());

        Submission saved = submissionRepository.save(submission);
        attemptSnapshotService.createSnapshot(saved);
        notifySubmissionChange(saved, false);
        return toSubmissionResponse(saved);
    }

    @Transactional
    @Override
    public SubmissionResponse beginSubmissionResubmission(
            UUID submissionId,
            Authentication authentication
    ) {
        Submission submission = submissionRepository.findByIdForUpdate(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found."));
        ensureTeamLeader(submission.getTeam(), authentication);

        if (submission.isDraft()) {
            return toSubmissionResponse(submission);
        }
        if (!submission.isScorable()) {
            throw new ConflictException(
                    "SUBMISSION_NOT_RESUBMITTABLE: Only submitted or late submissions can be resubmitted.");
        }

        ensureRoundCanAcceptSubmission(submission.getRound());
        attemptSnapshotService.createSnapshot(submission);
        submission.beginResubmission();
        return toSubmissionResponse(submissionRepository.save(submission));
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
        if (!MENTOR_VISIBLE_STATUSES.contains(submission.getStatus())) {
            throw new NotFoundException("Submission not found.");
        }

        return toSubmissionDetailResponse(submission);
    }

    // HELPER METHODS
    private Team getTeam(UUID teamId) {
        return teamRepository.findById(teamId)
                .orElseThrow(() -> new NotFoundException("Team not found."));
    }

    private Team getTeamForSubmissionMutation(UUID teamId) {
        return teamRepository.findByIdForUpdate(teamId)
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

    private Submission getSubmissionForUpdate(UUID submissionId) {
        return submissionRepository.findByIdForUpdate(submissionId)
                .orElseThrow(() -> new NotFoundException("Submission not found."));
    }

    private void ensureDraftSubmission(Submission submission) {
        if (!submission.isDraft()) {
            throw new ConflictException(
                    "SUBMISSION_RESUBMISSION_REQUIRED: Begin a resubmission before changing finalized evidence.");
        }
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

    private void ensureCanViewRequirements(
            Team team,
            Submission currentSubmission,
            Authentication authentication
    ) {
        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }

        UUID userId = CurrentUser.id(authentication);
        if (team.getLeader() != null && userId.equals(team.getLeader().getId())) {
            return;
        }
        if (teamMemberRepository.existsByTeamIdAndUserIdAndLeftAtIsNull(team.getId(), userId)) {
            return;
        }
        if (isMentorAssignedToTeam(team, userId)) {
            return;
        }
        if (currentSubmission != null
                && currentSubmission.isScorable()
                && isJudgeAssignedToSubmission(currentSubmission, userId)) {
            return;
        }

        throw new ForbiddenException("You do not have access to this team's submission requirements.");
    }

    private void ensureTeamCanSubmit(Team team) {
        if (team.getRegistrationStatus() != TeamRegistrationStatus.APPROVED) {
            throw new ConflictException("Only teams with APPROVED registration may submit deliverables.");
        }

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
        ensureSubmissionDeadlineNotPassed(round);
        if (round.getStatus() != RoundStatus.OPEN) {
            throw new ConflictException("Submissions are only allowed while the round is OPEN.");
        }
    }

    private void ensureSubmissionDeadlineNotPassed(Round round) {
        LocalDateTime deadline = round.getSubmissionDeadline();
        if (deadline != null && !LocalDateTime.now().isBefore(deadline)) {
            throw new ConflictException(
                    "ROUND_SUBMISSION_DEADLINE_EXCEEDED: The submission deadline for this round has passed.");
        }
    }

    private void ensureTeamLeader(Team team, Authentication authentication) {
        UUID userId = CurrentUser.id(authentication);
        if (team.getLeader() == null || !team.getLeader().getId().equals(userId)) {
            throw new ForbiddenException("Only the team leader can manage this submission.");
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
        throw new ForbiddenException("You do not have access to this team's submissions.");
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
        throw new ForbiddenException("You do not have access to this submission.");
    }

    private void ensureMentorAssignedToTeam(Team team, Authentication authentication) {
        UUID currentUserId = CurrentUser.id(authentication);

        if (CurrentUser.isAdminOrCoordinator(authentication)) {
            return;
        }

        if (!isMentorAssignedToTeam(team, currentUserId)) {
            throw new ForbiddenException("Mentor is not assigned to this team's track.");
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
            throw new ForbiddenException("Only coordinator or admin can access submission management.");
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
        // Uploaded and imported evidence owns provider metadata that cannot be
        // reconstructed from a URL-only draft request. Replace only editable URLs.
        submissionLinkRepository
                .deleteBySubmissionIdAndObjectKeyIsNullAndProviderResourceIdIsNull(
                        submission.getId()
                );
        List<SubmissionLink> entities = links.stream()
                .map(link -> toLinkEntity(submission, link))
                .toList();
        submissionLinkRepository.saveAll(entities);
    }

    private boolean isManagedGithubSnapshot(SubmissionLink link) {
        return link.getStorageProvider() == SubmissionStorageProvider.GITHUB
                && link.getProviderResourceId() != null
                && link.getRepoMetadata() != null
                && link.getRepoMetadata().getCommitSha() != null;
    }

    private LocalDateTime toUtc(java.time.Instant value) {
        return value == null ? null : LocalDateTime.ofInstant(value, ZoneOffset.UTC);
    }

    private SubmissionLink toLinkEntity(Submission submission, SubmissionLinkRequest request) {
        SubmissionLinkType parsedType = parseLinkType(request.linkType());
        String normalizedUrl = normalizeHttpUrl(request.url());
        return SubmissionLink.builder()
                .submission(submission)
                .linkType(parsedType)
                .url(normalizedUrl)
                .label(blankToNull(request.label()))
                .storageProvider(detectStorageProvider(parsedType, normalizedUrl))
                .repoMetadata(repositoryMetadataService.fetchMetadataIfRepository(parsedType, normalizedUrl))
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
        ensureAdditionalFileAllowed(submission);

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

    private void ensureAdditionalFileAllowed(Submission submission) {
        int maximumFiles = requirementCatalog.uploadPolicy().maximumFiles();
        long persistedFiles = submissionLinkRepository
                .countBySubmissionIdAndObjectKeyIsNotNull(submission.getId());
        if (persistedFiles >= maximumFiles) {
            throw SubmissionUploadException.conflict(
                    "SUBMISSION_FILE_LIMIT_REACHED",
                    "A submission can contain at most " + maximumFiles + " files."
            );
        }
    }

    private void deleteFailedSnapshot(UploadedSubmissionFile uploaded) {
        if (uploaded == null || uploaded.objectKey() == null) {
            return;
        }
        try {
            submissionFileStorageService.deleteSubmissionFile(uploaded.objectKey());
        } catch (RuntimeException cleanupException) {
            log.warn(
                    "Failed to clean up Google Drive snapshot after import failure. objectKey={}",
                    uploaded.objectKey(),
                    cleanupException
            );
        }
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

    private String normalizeHttpUrl(String rawUrl) {
        if (rawUrl == null || rawUrl.isBlank()) {
            throw new BadRequestException("Submission link URL is required.");
        }

        String trimmedUrl = rawUrl.trim();
        URI uri;
        try {
            uri = new URI(trimmedUrl);
        } catch (URISyntaxException ex) {
            throw new BadRequestException("Submission link URL must be a valid HTTP or HTTPS URL.");
        }

        String scheme = uri.getScheme();
        if (scheme == null
                || (!scheme.equalsIgnoreCase("http") && !scheme.equalsIgnoreCase("https"))
                || uri.getHost() == null
                || uri.getHost().isBlank()) {
            throw new BadRequestException("Submission link URL must start with http:// or https://.");
        }

        return trimmedUrl;
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
        } catch (RuntimeException ex) {
            log.warn(
                    "Failed to create submission notifications. submissionId={}, teamId={}, roundId={}",
                    submission.getId(),
                    team.getId(),
                    round.getId(),
                    ex
            );
        }
    }

    private void markSubmittedBeforeDeadline(Submission submission, Round round) {
        ensureSubmissionDeadlineNotPassed(round);
        submission.markSubmitted();
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
                link.getProviderResourceId(),
                link.getProviderChecksum(),
                link.getProviderModifiedAt(),
                link.getRepoMetadata(),
                link.getIsPrimary(),
                link.getDisplayOrder(),
                link.getCreatedAt(),
                link.getUpdatedAt()
        );
    }

    private SubmissionAttemptResponse toSubmissionAttemptResponse(SubmissionAttempt attempt) {
        List<SubmissionAttemptEvidenceResponse> evidence = attempt.getLinks()
                .stream()
                .map(this::toSubmissionAttemptEvidenceResponse)
                .toList();

        return new SubmissionAttemptResponse(
                attempt.getId(),
                attempt.getSubmission().getId(),
                attempt.getAttemptNumber(),
                attempt.getNote(),
                attempt.getStatus().name(),
                attempt.getSubmittedAt(),
                attempt.getCreatedAt(),
                evidence
        );
    }

    private SubmissionAttemptEvidenceResponse toSubmissionAttemptEvidenceResponse(
            SubmissionAttemptLink evidence
    ) {
        SubmissionStorageProvider provider = evidence.getStorageProvider() == null
                ? SubmissionStorageProvider.EXTERNAL_URL
                : evidence.getStorageProvider();
        String safeUrl = provider == SubmissionStorageProvider.AWS_S3
                ? null
                : evidence.getUrl();

        return new SubmissionAttemptEvidenceResponse(
                evidence.getId(),
                evidence.getSourceLinkId(),
                evidence.getLinkType().name(),
                safeUrl,
                evidence.getLabel(),
                provider.name(),
                evidence.getOriginalFileName(),
                evidence.getContentType(),
                evidence.getFileSizeBytes(),
                evidence.getProviderResourceId(),
                evidence.getProviderChecksum(),
                evidence.getProviderModifiedAt(),
                evidence.getRepoMetadata(),
                evidence.getIsPrimary(),
                evidence.getDisplayOrder(),
                evidence.getCreatedAt()
        );
    }

    private String blankToNull(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }
}
