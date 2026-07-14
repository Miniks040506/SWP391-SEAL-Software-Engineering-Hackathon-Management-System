package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.grading.GradingSubmissionDetailResponse;
import com.t7.seal.response.grading.JudgeSubmissionAssignmentResponse;
import com.t7.seal.response.grading.JudgeSubmissionQueueSummaryResponse;
import com.t7.seal.response.round.JudgeAssignmentResponse;
import com.t7.seal.service.JudgeAssignmentService;
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
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Judges",
        description = "Judge assignments and assigned-submission queues."
)
public class JudgeController {

    private final JudgeAssignmentService judgeAssignmentService;

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get My Assignments",
            description = "Get My Assignments through GET /api/v1/judge/assignments; GET /api/v1/judges/me/assignments. Successful execution returns HTTP 200 with List<JudgeAssignmentResponse>. Access: SecurityConfig role JUDGE via matcher /api/v1/judge/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my assignments completed successfully.",
                    useReturnTypeSchema = true
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping({"/judge/assignments", "/judges/me/assignments"})
    public ResponseEntity<List<JudgeAssignmentResponse>> getMyAssignments(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(judgeAssignmentService.getMyAssignments(authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get My Assigned Submissions",
            description = "Get My Assigned Submissions through GET /api/v1/judge/submissions; GET /api/v1/judges/me/submissions. Successful execution returns HTTP 200 with PageResponse<JudgeSubmissionAssignmentResponse>. Access: SecurityConfig role JUDGE via matcher /api/v1/judge/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my assigned submissions completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping({"/judge/submissions", "/judges/me/submissions"})
    public ResponseEntity<PageResponse<JudgeSubmissionAssignmentResponse>> getMyAssignedSubmissions(
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId,
            @Parameter(description = "Optional status filter. (optional)", required = false)
            @RequestParam(required = false) String status,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
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
