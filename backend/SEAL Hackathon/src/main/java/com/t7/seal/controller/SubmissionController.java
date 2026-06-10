package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.response.submission.*;
import com.t7.seal.service.SubmissionService;
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
public class SubmissionController {

    private final SubmissionService submissionService;

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

    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getSubmissionById(
            @PathVariable("submissionId") UUID submissionId
    ) {
        return null;
    }

    @PatchMapping("/submissions/{submissionId}")
    public ResponseEntity<SubmissionResponse> updateSubmission(
            @PathVariable("submissionId") UUID submissionId,
            @Valid @RequestBody UpdateSubmissionRequest request
    ) {
        return null;
    }

    @PostMapping("/submissions/{submissionId}/links")
    public ResponseEntity<SubmissionResponse> addSubmissionLinks(
            @PathVariable("submissionId") UUID submissionId,
            @Valid @RequestBody SubmissionLinkRequest request
    ) {
        return null;
    }

    @PatchMapping("/submission-links/{linkId}")
    public ResponseEntity<SubmissionLinkResponse> updateSubmissionLink(
            @PathVariable("linkId") UUID linkId,
            @Valid @RequestBody SubmissionLinkRequest request
    ) {
        return null;
    }

    @DeleteMapping("/submission-links/{linkId}")
    public ResponseEntity<Void> deleteSubmissionLink(
            @PathVariable("linkId") UUID linkId
    ) {
        return null;
    }

    @GetMapping("/submissions/{submissionId}/scores/me")
    public ResponseEntity<TeamDetailedScoreResponse> getMyTeamDetailedScores(
            @PathVariable("submissionId") UUID submissionId
    ) {
        return null;
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORIDINATOR')")
    @GetMapping("/mentor/teams/{teamId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getMentorTeamSubmissions(
            @PathVariable("teamId") UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getMentorTeamSubmissions(teamId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORIDINATOR')")
    @GetMapping("/mentor/submissions/{submissionId}")
    public ResponseEntity<SubmissionDetailResponse> getMentorSubmissionById(
            @PathVariable("submissionId") UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(submissionService.getMentorSubmissionById(submissionId, authentication));
    }
}
