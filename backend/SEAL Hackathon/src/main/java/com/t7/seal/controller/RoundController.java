package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.round.*;
import com.t7.seal.response.round.*;
import com.t7.seal.service.JudgeAssignmentService;
import com.t7.seal.service.RoundService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
public class RoundController {

    private final RoundService roundService;
    private final JudgeAssignmentService judgeAssignmentService;

    @PreAuthorize("@eventSecurity.canCreateRound(#eventId, authentication)")
    @PostMapping("/events/{eventId}/rounds")
    public ResponseEntity<RoundResponse> createRound(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateRoundRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roundService.createRound(eventId, request, authentication));
    }

    @GetMapping("/events/{eventId}/rounds")
    public ResponseEntity<List<RoundResponse>> getRoundsByEvent(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getRoundsByEvent(eventId, authentication));
    }

    @GetMapping("/rounds/{roundId}")
    public ResponseEntity<RoundDetailResponse> getRoundById(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getRoundById(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PatchMapping("/rounds/{roundId}")
    public ResponseEntity<RoundResponse> updateRound(
            @PathVariable UUID roundId,
            @Valid @RequestBody UpdateRoundRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.updateRound(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @DeleteMapping("/rounds/{roundId}")
    public ResponseEntity<Void> deleteRound(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        roundService.deleteRound(roundId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/rounds/{roundId}/lock-submissions")
    public ResponseEntity<RoundLockResponse> lockSubmissions(
            @PathVariable UUID roundId
    ) {
        return null;
    }

    @PostMapping("/rounds/{roundId}/lock-grading")
    public ResponseEntity<RoundLockResponse> lockGrading(
            @PathVariable UUID roundId
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/scoring-progress")
    public ResponseEntity<ScoringProgressResponse> getScoringProgress(
            @PathVariable UUID roundId
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/advancement-preview")
    public ResponseEntity<AdvancementPreviewResponse> getAdvancementPreview(
            @PathVariable UUID roundId
    ) {
        return null;
    }

    @PostMapping("/rounds/{roundId}/confirm-advancement")
    public ResponseEntity<ConfirmAdvancementResponse> confirmAdvancement(
            @PathVariable UUID roundId,
            @Valid @RequestBody ConfirmAdvancementRequest request
    ) {
        return null;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<List<AdvanceRuleResponse>> getAdvanceRules(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getAdvanceRules(roundId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<AdvanceRuleResponse> createAdvanceRule(
            @PathVariable UUID roundId,
            @Valid @RequestBody CreateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roundService.createAdvanceRule(roundId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PatchMapping("/advance-rules/{ruleId}")
    public ResponseEntity<AdvanceRuleResponse> updateAdvanceRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody UpdateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.updateAdvanceRule(ruleId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @DeleteMapping("/advance-rules/{ruleId}")
    public ResponseEntity<Void> deleteAdvanceRule(
            @PathVariable UUID ruleId,
            Authentication authentication
    ) {
        roundService.deleteAdvanceRule(ruleId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping("/rounds/{roundId}/judge-assignments")
    public ResponseEntity<List<JudgeAssignmentResponse>> getJudgeAssignments(@PathVariable UUID roundId) {
        return ResponseEntity.ok(judgeAssignmentService.getJudgeAssignments(roundId));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/judge-assignments")
    public ResponseEntity<JudgeAssignmentResponse> assignJudge(
            @PathVariable UUID roundId,
            @Valid @RequestBody AssignJudgeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(judgeAssignmentService.assignJudge(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @DeleteMapping("/rounds/{roundId}/judge-assignments/{assignmentId}")
    public ResponseEntity<Void> removeJudgeAssignment(
            @PathVariable UUID roundId,
            @PathVariable UUID assignmentId,
            Authentication authentication
    ) {
        judgeAssignmentService.removeJudgeAssignment(roundId, assignmentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/judge-assignments/{assignmentId}")
    public ResponseEntity<Void> removeJudgeAssignmentById(
            @PathVariable UUID assignmentId,
            Authentication authentication
    ) {

        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/open")
    public ResponseEntity<RoundResponse> openRound(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("rounds/{roundId}/close")
    public ResponseEntity<RoundResponse> closeRound(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/lock-submissions")
    public ResponseEntity<RoundLockResponse> lockSubmissions(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping("/rounds/{roundId}/operation-status")
    public ResponseEntity<RoundOperationStatusResponse> getOperationStatus(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return null;
    }
}
