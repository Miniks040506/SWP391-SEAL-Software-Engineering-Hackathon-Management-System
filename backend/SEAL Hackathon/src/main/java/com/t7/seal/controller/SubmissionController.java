package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.submission.SubmitDeliverablesRequest;
import com.t7.seal.request.submission.SubmissionLinkRequest;
import com.t7.seal.request.submission.UpdateSubmissionRequest;
import com.t7.seal.response.submission.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class SubmissionController {
    @PostMapping("/teams/{teamId}/rounds/{roundId}/submission")
    public ResponseEntity<SubmissionResponse> submitDeliverables(
            @PathVariable("teamId") UUID teamId,
            @PathVariable("roundId") UUID roundId,
            @Valid @RequestBody SubmitDeliverablesRequest request
    ) {
        return null;

    }

    @GetMapping("/teams/{teamId}/submissions")
    public ResponseEntity<List<SubmissionSummaryResponse>> getTeamSubmissions(
            @PathVariable("teamId") UUID teamId
    ) {
        return null;
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
}
