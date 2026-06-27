package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.grading.GradingSubmissionDetailResponse;
import com.t7.seal.response.grading.JudgeSubmissionAssignmentResponse;
import com.t7.seal.response.grading.JudgeSubmissionQueueSummaryResponse;
import com.t7.seal.response.round.JudgeAssignmentResponse;
import com.t7.seal.service.JudgeAssignmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class JudgeController {

    private final JudgeAssignmentService judgeAssignmentService;

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({"/judge/assignments", "/judges/me/assignments"})
    public ResponseEntity<List<JudgeAssignmentResponse>> getMyAssignments(Authentication authentication) {
        return ResponseEntity.ok(judgeAssignmentService.getMyAssignments(authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({"/judge/submissions", "/judges/me/submissions"})
    public ResponseEntity<PageResponse<JudgeSubmissionAssignmentResponse>> getMyAssignedSubmissions(
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService.getMySubmissionQueue(roundId, status, page, size, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({"/judge/rounds/{roundId}/submissions", "/judges/me/rounds/{roundId}/submissions"})
    public ResponseEntity<PageResponse<JudgeSubmissionAssignmentResponse>> getMyAssignedSubmissionsByRound(
            @PathVariable UUID roundId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService.getMySubmissionQueue(roundId, status, page, size, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({
            "/judge/submissions/summary",
            "/judges/me/submissions/summary"
    })
    public ResponseEntity<JudgeSubmissionQueueSummaryResponse> getMySubmissionSummary(
            Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService
                .getMySubmissionQueueSummary(null, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({
            "/judge/rounds/{roundId}/submissions/summary",
            "/judges/me/rounds/{roundId}/submissions/summary"
    })
    public ResponseEntity<JudgeSubmissionQueueSummaryResponse> getMyRoundSubmissionSummary(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService
                .getMySubmissionQueueSummary(roundId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({"/judge/submissions/{submissionId}", "/judges/me/submissions/{submissionId}"})
    public ResponseEntity<GradingSubmissionDetailResponse> getMyAssignedSubmissionDetail(
            @PathVariable UUID submissionId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService.getMySubmissionDetail(submissionId, authentication));
    }
}
