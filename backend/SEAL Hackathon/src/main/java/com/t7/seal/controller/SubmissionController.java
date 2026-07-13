package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.request.results.DisqualifySubmissionRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.submission.*;
import com.t7.seal.response.results.DisqualificationResponse;
import com.t7.seal.service.DisqualificationService;
import com.t7.seal.service.RankingService;
import com.t7.seal.service.SubmissionService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Submissions",
        description = "Submission drafts, deliverables, files, metadata, and score visibility."
)
public class SubmissionController {

    private final SubmissionService submissionService;
    private final RankingService rankingService;
    private final DisqualificationService disqualificationService;

    @PreAuthorize("isAuthenticated()")
    @PostMapping({
            "/teams/{teamId}/rounds/{roundId}/submission",
            "/teams/{teamId}/rounds/{roundId}/submissions"
    })
    public ResponseEntity<SubmissionResponse> submitDeliverables(
            @PathVariable UUID teamId,
            @PathVariable UUID roundId,
            @Valid @RequestBody SubmitDeliverablesRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.submitDeliverables(teamId, roundId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping({
            "/teams/{teamId}/rounds/{roundId}/submission/draft",
            "/teams/{teamId}/rounds/{roundId}/submissions/draft"
    })
    public ResponseEntity<SubmissionResponse> saveSubmissionDraft(
            @PathVariable UUID teamId,
            @PathVariable UUID roundId,
            @Valid @RequestBody(required = false) UpdateSubmissionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.saveSubmissionDraft(teamId, roundId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = {
            "/teams/{teamId}/rounds/{roundId}/submission/file",
            "/teams/{teamId}/rounds/{roundId}/submissions/files"
    }, consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponse> uploadSubmissionFile(
            @PathVariable UUID teamId,
            @PathVariable UUID roundId,
            @RequestParam String linkType,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) String label,
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false, defaultValue = "false") Boolean submitNow,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.uploadSubmissionFile(
                        teamId, roundId, linkType,
                        note, label, isPrimary,
                        displayOrder, submitNow,
                        file, authentication
                ));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping(value = "/submissions/{submissionId}/files", consumes = "multipart/form-data")
    public ResponseEntity<SubmissionResponse> uploadFileToSubmission(
            @PathVariable UUID submissionId,
            @RequestParam String linkType,
            @RequestParam(required = false) String label,
            @RequestParam(required = false, defaultValue = "false") Boolean isPrimary,
            @RequestParam(required = false, defaultValue = "0") Integer displayOrder,
            @RequestParam(required = false, defaultValue = "false") Boolean submitNow,
            @RequestPart("file") MultipartFile file,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.uploadFileToSubmission(
                        submissionId, linkType,
                        label, isPrimary,
                        displayOrder, submitNow,
                        file, authentication
                ));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/teams/{teamId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getTeamSubmissions(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getTeamSubmissions(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionById(
            @PathVariable UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.
                getSubmissionById(submissionId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @GetMapping("/submissions/{submissionId}/admin-view")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionAdminView(
            @PathVariable UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.
                getSubmissionForAdmin(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionResponse> updateSubmission(
            @PathVariable UUID submissionId,
            @Valid @RequestBody UpdateSubmissionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.
                updateSubmission(submissionId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/submissions/{submissionId}/submit")
    public ResponseEntity<SubmissionResponse> submitExistingSubmission(
            @PathVariable UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.submitExistingSubmission(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/submissions/{submissionId}/links")
    public ResponseEntity<SubmissionResponse> addSubmissionLinks(
            @PathVariable UUID submissionId,
            @Valid @RequestBody SubmissionLinkRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(submissionService.addSubmissionLinks(submissionId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/submission-links/{linkId}")
    public ResponseEntity<SubmissionLinkResponse> updateSubmissionLink(
            @PathVariable UUID linkId,
            @Valid @RequestBody SubmissionLinkRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.updateSubmissionLink(linkId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/submission-links/{linkId}")
    public ResponseEntity<Void> deleteSubmissionLink(
            @PathVariable UUID linkId,
            Authentication authentication
    ) {
        submissionService.deleteSubmissionLink(linkId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/submissions/{submissionId}/disqualify")
    public ResponseEntity<DisqualificationResponse> disqualifySubmission(
            @PathVariable UUID submissionId,
            @Valid @RequestBody DisqualifySubmissionRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(disqualificationService
                        .disqualifySubmission(submissionId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @GetMapping("/submissions")
    public ResponseEntity<PageResponse<CoordinatorSubmissionSummaryResponse>> getEventSubmissions(
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getEventSubmissions(eventId, roundId, trackId, status, search, page, size, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @GetMapping("/rounds/{roundId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getRoundSubmissions(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getRoundSubmissions(roundId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN','COORDINATOR')")
    @GetMapping("/tracks/{trackId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getTrackSubmissions(
            @PathVariable UUID trackId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getTrackSubmissions(trackId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping("/mentor/teams/{teamId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getMentorTeamSubmissions(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getMentorTeamSubmissions(teamId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping("/mentor/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getMentorSubmissionById(
            @PathVariable UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getMentorSubmissionById(submissionId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/submission-links/{linkId}/download-url")
    public ResponseEntity<FileDownloadUrlResponse> createSubmissionFileDownloadUrl(
            @PathVariable UUID linkId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.createSubmissionFileDownloadUrl(linkId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/submissions/{submissionId}/scores/me")
    public ResponseEntity<TeamDetailedScoreResponse> getMyTeamDetailedScores(
            @PathVariable UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.getPublishedSubmissionScore(submissionId, authentication));
    }
}
