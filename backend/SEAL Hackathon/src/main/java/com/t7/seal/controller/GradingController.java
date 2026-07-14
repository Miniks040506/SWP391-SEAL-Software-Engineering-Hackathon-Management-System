package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.request.grading.UpdateScoreRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.grading.AssignedSubmissionResponse;
import com.t7.seal.response.grading.GradingSubmissionDetailResponse;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import com.t7.seal.service.GradingService;
import com.t7.seal.service.JudgeAssignmentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jdk.management.jfr.RemoteRecordingStream;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/grading")
@Tag(
        name = "Grading",
        description = "Judge score-sheet retrieval, draft save, and final submission."
)
public class GradingController {

    private final JudgeAssignmentService judgeAssignmentService;
    private final GradingService gradingService;

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get Assigned Submissions",
            description = "Get Assigned Submissions through GET /api/v1/grading/rounds/{roundId}/assigned-submissions. Successful execution returns HTTP 200 with PageResponse<AssignedSubmissionResponse>. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            operationId = "gradingGetAssignedSubmissions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get assigned submissions completed successfully.",
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
    @GetMapping("/rounds/{roundId}/assigned-submissions")
    public ResponseEntity<PageResponse<AssignedSubmissionResponse>> getAssignedSubmissions(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable("roundId") UUID roundId,
            @Parameter(description = "Optional status filter. (optional)", required = false)
            @RequestParam(required = false) String status,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService.getMyAssignedSubmissionsForGrading(
                roundId, status, page, size, authentication
        ));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get Submission For Grading",
            description = "Get Submission For Grading through GET /api/v1/grading/submissions/{submissionId}. Successful execution returns HTTP 200 with GradingSubmissionDetailResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            operationId = "gradingGetSubmissionForGrading",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get submission for grading completed successfully.",
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
    @GetMapping("/submissions/{submissionId}")
    public ResponseEntity<GradingSubmissionDetailResponse> getSubmissionForGrading(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable("submissionId") UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(judgeAssignmentService.getMySubmissionDetail(submissionId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get Score Sheet",
            description = "Get Score Sheet through GET /api/v1/grading/submissions/{submissionId}/score-sheet; GET /api/v1/grading/submissions/{submissionId}/my-scores. Successful execution returns HTTP 200 with ScoreSheetResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get score sheet completed successfully.",
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
            "/submissions/{submissionId}/score-sheet",
            "/submissions/{submissionId}/my-scores",
    })
    public ResponseEntity<ScoreSheetResponse> getScoreSheet(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.getScoreSheets(submissionId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get My Scores For Submission",
            description = "Get My Scores For Submission through GET /api/v1/grading/submissions/{submissionId}/scores. Successful execution returns HTTP 200 with ScoreSheetResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            operationId = "gradingGetMyScoresForSubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my scores for submission completed successfully.",
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
    @GetMapping("/submissions/{submissionId}/scores")
    public ResponseEntity<ScoreSheetResponse> getMyScoresForSubmission(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.getScoreSheets(submissionId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Save Draft Scores",
            description = "Save Draft Scores through POST /api/v1/grading/submissions/{submissionId}/scores/draft. Successful execution returns HTTP 200 with ScoreSheetResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\"). Requires a SaveScoreSheetRequest request body validated with Jakarta Bean Validation.",
            operationId = "gradingSaveDraftScores",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Save draft scores completed successfully.",
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
    @PostMapping("/submissions/{submissionId}/scores/draft")
    public ResponseEntity<ScoreSheetResponse> saveDraftScores(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody SaveScoreSheetRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.saveDraft(submissionId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Submit Final Scores",
            description = "Submit Final Scores through POST /api/v1/grading/submissions/{submissionId}/scores/submit. Successful execution returns HTTP 200 with ScoreSheetResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\"). Requires a SaveScoreSheetRequest request body validated with Jakarta Bean Validation.",
            operationId = "gradingSubmitFinalScores",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submit final scores completed successfully.",
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
    @PostMapping("/submissions/{submissionId}/scores/submit")
    public ResponseEntity<ScoreSheetResponse> submitFinalScores(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody SaveScoreSheetRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.submitFinal(submissionId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Save Scores",
            description = "Save Scores through POST /api/v1/grading/submissions/{submissionId}/scores. Successful execution returns HTTP 200 with ScoreSheetResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\"). Requires a SaveScoreSheetRequest request body validated with Jakarta Bean Validation.",
            operationId = "gradingSaveScores",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Save scores completed successfully.",
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
    @PostMapping("/submissions/{submissionId}/scores")
    public ResponseEntity<ScoreSheetResponse> saveScores(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody SaveScoreSheetRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        boolean draft = request.draft() == null || request.draft();

        return ResponseEntity.ok(draft
                ? gradingService.saveDraft(submissionId, request, authentication)
                : gradingService.submitFinal(submissionId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Confirm Score Sheet",
            description = "Confirm Score Sheet through POST /api/v1/grading/submissions/{submissionId}/scores/confirm. Successful execution returns HTTP 200 with ScoreSheetResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\"). Requires a ConfirmScoreSheetRequest request body validated with Jakarta Bean Validation.",
            operationId = "gradingConfirmScoreSheet",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Confirm score sheet completed successfully.",
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
    @PostMapping("/submissions/{submissionId}/scores/confirm")
    public ResponseEntity<ScoreSheetResponse> confirmScoreSheet(
            @Parameter(description = "Unique submission identifier.", required = true)
            @PathVariable UUID submissionId,
            @Valid @RequestBody ConfirmScoreSheetRequest request,
            @Parameter(hidden = true) Authentication authentication

    ) {
        return ResponseEntity.ok(gradingService.confirmScoreSheet(submissionId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Update Score",
            description = "Update Score through PATCH /api/v1/grading/scores/{scoreId}. Successful execution returns HTTP 200 with ScoreResponse. Access: SecurityConfig role JUDGE via matcher /api/v1/grading/**; @PreAuthorize(\"hasRole('JUDGE')\"). Requires an UpdateScoreRequest request body validated with Jakarta Bean Validation.",
            operationId = "gradingUpdateScore",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update score completed successfully.",
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
    @PatchMapping("/scores/{scoreId}")
    public ResponseEntity<ScoreResponse> updateScore(
            @Parameter(description = "Score Id value.", required = true)
            @PathVariable("scoreId") UUID scoreId,
            @Valid @RequestBody UpdateScoreRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(gradingService.updateScore(scoreId, request, authentication));
    }
}
