package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.round.*;
import com.t7.seal.response.round.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
public class RoundController {

    @PostMapping("/events/{eventId}/rounds")
    public ResponseEntity<RoundResponse> createRound(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateRoundRequest request
    ) {
        return null;
    }

    @GetMapping("/events/{eventId}/rounds")
    public ResponseEntity<List<RoundResponse>> getRoundsByEvent(
            @PathVariable UUID eventId
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}")
    public ResponseEntity<RoundDetailResponse> getRoundById(
            @PathVariable UUID roundId
    ) {
        return null;
    }

    @PatchMapping("/rounds/{roundId}")
    public ResponseEntity<RoundResponse> updateRound(
            @PathVariable UUID roundId,
            @Valid @RequestBody UpdateRoundRequest request
    ) {
        return null;
    }

    @DeleteMapping("/rounds/{roundId}")
    public ResponseEntity<Void> deleteRound(
            @PathVariable UUID roundId
    ) {
        return null;
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
    public ResponseEntity<ScoringProgressResponse> getScoringProgress(@PathVariable UUID roundId) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/advancement-preview")
    public ResponseEntity<AdvancementPreviewResponse> getAdvancementPreview(@PathVariable UUID roundId) {
        return null;
    }

    @PostMapping("/rounds/{roundId}/confirm-advancement")
    public ResponseEntity<ConfirmAdvancementResponse> confirmAdvancement(
            @PathVariable UUID roundId,
            @Valid @RequestBody ConfirmAdvancementRequest request
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<List<AdvanceRuleResponse>> getAdvanceRules(@PathVariable UUID roundId) {
        return null;
    }

    @PostMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<AdvanceRuleResponse> createAdvanceRule(
            @PathVariable UUID roundId,
            @Valid @RequestBody CreateAdvanceRuleRequest request
    ) {
        return null;
    }

    @PatchMapping("/advance-rules/{ruleId}")
    public ResponseEntity<AdvanceRuleResponse> updateAdvanceRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody UpdateAdvanceRuleRequest request
    ) {
        return null;
    }

    @DeleteMapping("/advance-rules/{ruleId}")
    public ResponseEntity<Void> deleteAdvanceRule(
            @PathVariable UUID ruleId
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/judge-assignments")
    public ResponseEntity<List<JudgeAssignmentResponse>> getJudgeAssignments(@PathVariable UUID roundId) {
        return null;
    }

    @PostMapping("/rounds/{roundId}/judge-assignments")
    public ResponseEntity<JudgeAssignmentResponse> assignJudge(
            @PathVariable UUID roundId,
            @Valid @RequestBody AssignJudgeRequest request
    ) {
        return null;
    }

    @DeleteMapping("/rounds/{roundId}/judge-assignments/{assignmentId}")
    public ResponseEntity<Void> removeJudgeAssignment(
            @PathVariable UUID roundId,
            @PathVariable UUID assignmentId
    ) {
        return null;
    }
}
