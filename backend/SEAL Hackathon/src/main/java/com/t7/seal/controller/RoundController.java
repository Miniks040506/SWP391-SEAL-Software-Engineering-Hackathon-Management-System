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

    @Operation(
            summary = "Get Round By Id",
            description = "Get Round By Id through GET /api/v1/rounds/{roundId}. Successful execution returns HTTP 200 with RoundDetailResponse. Access: Public via SecurityConfig matcher /api/v1/rounds/*.",
            operationId = "roundGetRoundById"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get round by id completed successfully.",
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
    @GetMapping("/rounds/{roundId}")
    public ResponseEntity<RoundDetailResponse> getRoundById(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getRoundById(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Update Round",
            description = "Update Round through PATCH /api/v1/rounds/{roundId}. Successful execution returns HTTP 200 with RoundResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\"). Requires an UpdateRoundRequest request body validated with Jakarta Bean Validation.",
            operationId = "roundUpdateRound",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update round completed successfully.",
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
    @PatchMapping("/rounds/{roundId}")
    public ResponseEntity<RoundResponse> updateRound(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody UpdateRoundRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.updateRound(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Delete Round",
            description = "Delete Round through DELETE /api/v1/rounds/{roundId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "roundDeleteRound",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Delete round completed successfully with no response body."),
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
    @DeleteMapping("/rounds/{roundId}")
    public ResponseEntity<Void> deleteRound(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        roundService.deleteRound(roundId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Lock Grading",
            description = "Lock Grading through POST /api/v1/rounds/{roundId}/lock-grading. Successful execution returns HTTP 200 with RoundLockResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/lock-grading; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "roundLockGrading",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Lock grading completed successfully.",
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
    @PostMapping("/rounds/{roundId}/lock-grading")
    public ResponseEntity<RoundLockResponse> lockGrading(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.lockGrading(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Get Scoring Progress",
            description = "Get Scoring Progress through GET /api/v1/rounds/{roundId}/scoring-progress; GET /api/v1/rounds/{roundId}/grading-status. Successful execution returns HTTP 200 with ScoringProgressResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/scoring-progress; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get scoring progress completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping({
            "/rounds/{roundId}/scoring-progress",
            "/rounds/{roundId}/grading-status"
    })
    public ResponseEntity<ScoringProgressResponse> getScoringProgress(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getScoringProgress(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Preview Advance Rules",
            description = "Preview Advance Rules through POST /api/v1/rounds/{roundId}/advance-rules/preview; POST /api/v1/rounds/{roundId}/advancement-preview; POST /api/v1/rounds/{roundId}/advancement/suggestions. Successful execution returns HTTP 200 with AdvancementPreviewResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/rounds/*/advance-rules/**; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Preview advance rules completed successfully.",
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
    @PostMapping({
            "/rounds/{roundId}/advance-rules/preview",
            "/rounds/{roundId}/advancement-preview",
            "/rounds/{roundId}/advancement/suggestions"
    })
    public ResponseEntity<AdvancementPreviewResponse> previewAdvanceRules(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.previewAdvanceRules(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Confirm Advancement",
            description = "Confirm Advancement through POST /api/v1/rounds/{roundId}/confirm-advancement; POST /api/v1/rounds/{roundId}/advancement/confirm. Successful execution returns HTTP 200 with ConfirmAdvancementResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/confirm-advancement; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\"). Requires a ConfirmAdvancementRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Confirm advancement completed successfully.",
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
    @PostMapping({
            "/rounds/{roundId}/confirm-advancement",
            "/rounds/{roundId}/advancement/confirm"
    })
    public ResponseEntity<ConfirmAdvancementResponse> confirmAdvancement(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody ConfirmAdvancementRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.confirmAdvancement(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Get Advance Rules",
            description = "Get Advance Rules through GET /api/v1/rounds/{roundId}/advance-rules. Successful execution returns HTTP 200 with List<AdvanceRuleResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/rounds/*/advance-rules; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "roundGetAdvanceRules",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get advance rules completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<List<AdvanceRuleResponse>> getAdvanceRules(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.getAdvanceRules(roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Create Advance Rule",
            description = "Create Advance Rule through POST /api/v1/rounds/{roundId}/advance-rules. Successful execution returns HTTP 201 with AdvanceRuleResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/rounds/*/advance-rules; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\"). Requires a CreateAdvanceRuleRequest request body validated with Jakarta Bean Validation.",
            operationId = "roundCreateAdvanceRule",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create advance rule completed and the resource was created.",
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
    @PostMapping("/rounds/{roundId}/advance-rules")
    public ResponseEntity<AdvanceRuleResponse> createAdvanceRule(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody CreateAdvanceRuleRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(roundService.createAdvanceRule(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageAdvanceRule(#ruleId, authentication)")
    @Operation(
            summary = "Update Advance Rule",
            description = "Update Advance Rule through PATCH /api/v1/advance-rules/{ruleId}. Successful execution returns HTTP 200 with AdvanceRuleResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/advance-rules/**; @PreAuthorize(\"@eventSecurity.canManageAdvanceRule(#ruleId, authentication)\"). Requires an UpdateAdvanceRuleRequest request body validated with Jakarta Bean Validation.",
            operationId = "roundUpdateAdvanceRule",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update advance rule completed successfully.",
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
    @PatchMapping("/advance-rules/{ruleId}")
    public ResponseEntity<AdvanceRuleResponse> updateAdvanceRule(
            @Parameter(description = "Rule Id value.", required = true)
            @PathVariable UUID ruleId,
            @Valid @RequestBody UpdateAdvanceRuleRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(roundService.updateAdvanceRule(ruleId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageAdvanceRule(#ruleId, authentication)")
    @Operation(
            summary = "Delete Advance Rule",
            description = "Delete Advance Rule through DELETE /api/v1/advance-rules/{ruleId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/advance-rules/**; @PreAuthorize(\"@eventSecurity.canManageAdvanceRule(#ruleId, authentication)\").",
            operationId = "roundDeleteAdvanceRule",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Delete advance rule completed successfully with no response body."),
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
    @DeleteMapping("/advance-rules/{ruleId}")
    public ResponseEntity<Void> deleteAdvanceRule(
            @Parameter(description = "Rule Id value.", required = true)
            @PathVariable UUID ruleId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        roundService.deleteAdvanceRule(ruleId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Get Judge Assignments",
            description = "Get Judge Assignments through GET /api/v1/rounds/{roundId}/judge-assignments. Successful execution returns HTTP 200 with List<JudgeAssignmentResponse>. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/judge-assignments/**; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "roundGetJudgeAssignments",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get judge assignments completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/rounds/{roundId}/judge-assignments")
    public ResponseEntity<List<JudgeAssignmentResponse>> getJudgeAssignments(@Parameter(description = "Unique round identifier.", required = true)
                                                                             @PathVariable UUID roundId) {
        return ResponseEntity.ok(judgeAssignmentService.getJudgeAssignments(roundId));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Assign Judge",
            description = "Assign Judge through POST /api/v1/rounds/{roundId}/judge-assignments. Successful execution returns HTTP 201 with JudgeAssignmentResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/judge-assignments/**; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\"). Requires an AssignJudgeRequest request body validated with Jakarta Bean Validation.",
            operationId = "roundAssignJudge",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Assign judge completed and the resource was created.",
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
    @PostMapping("/rounds/{roundId}/judge-assignments")
    public ResponseEntity<JudgeAssignmentResponse> assignJudge(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody AssignJudgeRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(judgeAssignmentService.assignJudge(roundId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Remove Judge Assignment",
            description = "Remove Judge Assignment through DELETE /api/v1/rounds/{roundId}/judge-assignments/{assignmentId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/judge-assignments/**; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "roundRemoveJudgeAssignment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Remove judge assignment completed successfully with no response body."),
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
    @DeleteMapping("/rounds/{roundId}/judge-assignments/{assignmentId}")
    public ResponseEntity<Void> removeJudgeAssignment(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(description = "Assignment Id value.", required = true)
            @PathVariable UUID assignmentId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        judgeAssignmentService.removeJudgeAssignment(roundId, assignmentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @Operation(
            summary = "Remove Judge Assignment By Id",
            description = "Remove Judge Assignment By Id through DELETE /api/v1/judge-assignments/{assignmentId}. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasRole('COORDINATOR')\").",
            operationId = "roundRemoveJudgeAssignmentById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Remove judge assignment by id completed successfully with no response body."),
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
    @DeleteMapping("/judge-assignments/{assignmentId}")
    public ResponseEntity<Void> removeJudgeAssignmentById(
            @Parameter(description = "Assignment Id value.", required = true)
            @PathVariable UUID assignmentId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        judgeAssignmentService.removeJudgeAssignmentById(assignmentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Open Round",
            description = "Open Round through POST /api/v1/rounds/{roundId}/open. Successful execution returns HTTP 200 with RoundResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/open; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "roundOpenRound",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Open round completed successfully.",
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
    @PostMapping("/rounds/{roundId}/open")
    public ResponseEntity<RoundResponse> openRound(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
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
