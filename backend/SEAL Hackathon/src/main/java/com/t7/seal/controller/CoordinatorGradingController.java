package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.grading.EventGradingProgressResponse;
import com.t7.seal.response.grading.JudgeAssignmentProgressResponse;
import com.t7.seal.response.grading.RoundGradingProgressResponse;
import com.t7.seal.response.grading.SubmissionGradingProgressResponse;
import com.t7.seal.service.GradingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@Tag(
        name = "Coordinator Grading",
        description = "Coordinator grading progress and score-sheet reopening."
)
public class CoordinatorGradingController {

    private final GradingService gradingService;

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @Operation(
            summary = "Get Event Grading Progress",
            description = "Get Event Grading Progress through GET /api/v1/events/{eventId}/grading-progress. Successful execution returns HTTP 200 with EventGradingProgressResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/grading-progress; @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\").",
            operationId = "coordinatorGradingGetEventGradingProgress",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get event grading progress completed successfully.",
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
    @GetMapping("/events/{eventId}/grading-progress")
    public ResponseEntity<EventGradingProgressResponse> getEventGradingProgress(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.getEventGradingProgress(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Get Round Grading Progress",
            description = "Get Round Grading Progress through GET /api/v1/rounds/{roundId}/grading-progress. Successful execution returns HTTP 200 with RoundGradingProgressResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/grading-progress; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "coordinatorGradingGetRoundGradingProgress",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get round grading progress completed successfully.",
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
    @GetMapping("/rounds/{roundId}/grading-progress")
    public ResponseEntity<RoundGradingProgressResponse> getRoundGradingProgress(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
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
