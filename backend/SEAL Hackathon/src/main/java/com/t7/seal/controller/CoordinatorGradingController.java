package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.grading.EventGradingProgressResponse;
import com.t7.seal.response.grading.JudgeAssignmentProgressResponse;
import com.t7.seal.response.grading.RoundGradingProgressResponse;
import com.t7.seal.response.grading.SubmissionGradingProgressResponse;
import com.t7.seal.service.GradingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class CoordinatorGradingController {

    private final GradingService gradingService;

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @GetMapping("/events/{eventId}/grading-progress")
    public ResponseEntity<EventGradingProgressResponse> getEventGradingProgress(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.getEventGradingProgress(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping("/rounds/{roundId}/grading-progress")
    public ResponseEntity<RoundGradingProgressResponse> getRoundGradingProgress(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.getRoundGradingProgress(roundId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @GetMapping("/judge-assignments/{assignmentId}/progress")
    public ResponseEntity<JudgeAssignmentProgressResponse> getJudgeAssignmentProgress(
            @PathVariable UUID assignmentId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.getJudgeAssignmentProgress(assignmentId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/submissions/{submissionId}/judges/{judgeId}/scores/reopen")
    public ResponseEntity<SubmissionGradingProgressResponse> reopenScoreSheet(
            @PathVariable UUID roundId,
            @PathVariable UUID submissionId,
            @PathVariable UUID judgeId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.reopenScoreSheet(roundId, submissionId, judgeId, authentication));
    }
}
