package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.round.*;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.round.*;
import com.t7.seal.service.JudgeAssignmentService;
import com.t7.seal.service.RoundService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(
        name = "Rounds",
        description = "Round lifecycle, advance rules, assignments, locks, and progress."
)
public class RoundController {

    private final RoundService roundService;
    private final JudgeAssignmentService judgeAssignmentService;

    @PreAuthorize("@eventSecurity.canCreateRound(#eventId, authentication)")
    @Operation(
            summary = "Create Round",
            description = "Create Round through POST /api/v1/events/{eventId}/rounds. Successful execution returns HTTP 201 with RoundResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/rounds; @PreAuthorize(\"@eventSecurity.canCreateRound(#eventId, authentication)\"). Requires a CreateRoundRequest request body validated with Jakarta Bean Validation.",
            operationId = "roundCreateRound",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create round completed and the resource was created.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/events/{eventId}/rounds")
    public ResponseEntity<RoundResponse> createRound(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateRoundRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roundService.createRound(eventId, request, authentication));
    }

    @Operation(
            summary = "Get Rounds By Event",
            description = "Get Rounds By Event through GET /api/v1/events/{eventId}/rounds. Successful execution returns HTTP 200 with List<RoundResponse>. Access: Public via SecurityConfig matcher /api/v1/events/*/rounds.",
            operationId = "roundGetRoundsByEvent"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get rounds by event completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/events/{eventId}/rounds")
    public ResponseEntity<List<RoundResponse>> getRoundsByEvent(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(hidden = true) Authentication authentication
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

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/lock-grading")
    public ResponseEntity<RoundLockResponse> lockGrading(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.lockGrading(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping({
            "/rounds/{roundId}/scoring-progress",
            "/rounds/{roundId}/grading-status"
    })
    public ResponseEntity<ScoringProgressResponse> getScoringProgress(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getScoringProgress(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping({
            "/rounds/{roundId}/advance-rules/preview",
            "/rounds/{roundId}/advancement-preview",
            "/rounds/{roundId}/advancement/suggestions"
    })
    public ResponseEntity<AdvancementPreviewResponse> previewAdvanceRules(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.previewAdvanceRules(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping({
            "/rounds/{roundId}/confirm-advancement",
            "/rounds/{roundId}/advancement/confirm"
    })
    public ResponseEntity<ConfirmAdvancementResponse> confirmAdvancement(
            @PathVariable UUID roundId,
            @Valid @RequestBody ConfirmAdvancementRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.confirmAdvancement(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<List<AdvanceRuleResponse>> getAdvanceRules(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getAdvanceRules(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<AdvanceRuleResponse> createAdvanceRule(
            @PathVariable UUID roundId,
            @Valid @RequestBody CreateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roundService.createAdvanceRule(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageAdvanceRule(#ruleId, authentication)")
    @PatchMapping("/advance-rules/{ruleId}")
    public ResponseEntity<AdvanceRuleResponse> updateAdvanceRule(
            @PathVariable UUID ruleId,
            @Valid @RequestBody UpdateAdvanceRuleRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.updateAdvanceRule(ruleId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageAdvanceRule(#ruleId, authentication)")
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
        judgeAssignmentService.removeJudgeAssignmentById(assignmentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/open")
    public ResponseEntity<RoundResponse> openRound(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.openRound(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/close")
    public ResponseEntity<RoundResponse> closeRound(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.closeRound(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/lock-submissions")
    public ResponseEntity<RoundLockResponse> lockSubmissions(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.lockSubmission(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping("/rounds/{roundId}/operation-status")
    public ResponseEntity<RoundOperationStatusResponse> getOperationStatus(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getOperationStatus(roundId, authentication));
    }
}
