package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.calibration.*;
import com.t7.seal.service.CalibrationService;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Calibration",
        description = "Calibration rounds, benchmark scoring, and score distributions."
)
public class CalibrationController {

    private final CalibrationService calibrationService;

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @Operation(
            summary = "Create Calibration Round",
            description = "Create Calibration Round through POST /api/v1/calibrations; POST /api/v1/events/{eventId}/calibration-rounds. Successful execution returns HTTP 200 with CalibrationRoundResponse. Access: SecurityConfig roles COORDINATOR, ADMIN via matcher /api/v1/calibrations; @PreAuthorize(\"hasRole('COORDINATOR') or hasRole('ADMIN')\"). Requires a CreateCalibrationRoundRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Create calibration round completed successfully.",
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
    @PostMapping({"/calibrations", "/events/{eventId}/calibration-rounds"})
    public ResponseEntity<CalibrationRoundResponse> createCalibrationRound(
            @Parameter(description = "Unique event identifier. (optional)", required = false)
            @PathVariable(value = "eventId", required = false) UUID eventId,
            @Valid @RequestBody CreateCalibrationRoundRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .createCalibrationRound(eventId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')")
    @Operation(
            summary = "Get Calibration Rounds By Event",
            description = "Get Calibration Rounds By Event through GET /api/v1/calibrations/events/{eventId}; GET /api/v1/events/{eventId}/calibration-rounds. Successful execution returns HTTP 200 with List<CalibrationRoundResponse>. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get calibration rounds by event completed successfully.",
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
    @GetMapping({"/calibrations/events/{eventId}", "/events/{eventId}/calibration-rounds"})
    public ResponseEntity<List<CalibrationRoundResponse>> getCalibrationRoundsByEvent(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable("eventId") UUID eventId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getCalibrationRoundsByEvent(eventId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get My Calibration Rounds",
            description = "Get My Calibration Rounds through GET /api/v1/calibrations/my. Successful execution returns HTTP 200 with List<CalibrationRoundResponse>. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            operationId = "calibrationGetMyCalibrationRounds",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my calibration rounds completed successfully.",
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
    @GetMapping("/calibrations/my")
    public ResponseEntity<List<CalibrationRoundResponse>> getMyCalibrationRounds(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService.getMyCalibrationRounds(authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @Operation(
            summary = "Get Managed Calibration Rounds",
            description = "Get Managed Calibration Rounds through GET /api/v1/calibrations/managed. Successful execution returns HTTP 200 with List<CalibrationRoundResponse>. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('COORDINATOR') or hasRole('ADMIN')\").",
            operationId = "calibrationGetManagedCalibrationRounds",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get managed calibration rounds completed successfully.",
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
    @GetMapping("/calibrations/managed")
    public ResponseEntity<List<CalibrationRoundResponse>> getManagedCalibrationRounds(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService.getManagedCalibrationRounds(authentication));
    }

    @PreAuthorize("hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')")
    @Operation(
            summary = "Get Calibration Round By Id",
            description = "Get Calibration Round By Id through GET /api/v1/calibrations/{calibrationId}; GET /api/v1/calibration-rounds/{calibrationId}. Successful execution returns HTTP 200 with CalibrationRoundDetailResponse. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get calibration round by id completed successfully.",
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
    @GetMapping({"/calibrations/{calibrationId}", "/calibration-rounds/{calibrationId}"})
    public ResponseEntity<CalibrationRoundDetailResponse> getCalibrationRoundById(
            @Parameter(description = "Unique calibration identifier.", required = true)
            @PathVariable("calibrationId") UUID calibrationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getCalibrationRoundById(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @Operation(
            summary = "Update Calibration Round",
            description = "Update Calibration Round through PATCH /api/v1/calibrations/{calibrationId}; PATCH /api/v1/calibration-rounds/{calibrationId}. Successful execution returns HTTP 200 with CalibrationRoundResponse. Access: SecurityConfig roles COORDINATOR, ADMIN via matcher /api/v1/calibrations/*; @PreAuthorize(\"hasRole('COORDINATOR') or hasRole('ADMIN')\"). Requires an UpdateCalibrationRoundRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update calibration round completed successfully.",
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
    @PatchMapping({"/calibrations/{calibrationId}", "/calibration-rounds/{calibrationId}"})
    public ResponseEntity<CalibrationRoundResponse> updateCalibrationRound(
            @Parameter(description = "Unique calibration identifier.", required = true)
            @PathVariable("calibrationId") UUID calibrationId,
            @Valid @RequestBody UpdateCalibrationRoundRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .updateCalibrationRound(calibrationId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get Score Sheet",
            description = "Get Score Sheet through GET /api/v1/calibrations/{calibrationId}/score-sheet; GET /api/v1/calibration-rounds/{calibrationId}/score-sheet. Successful execution returns HTTP 200 with CalibrationScoreSheetResponse. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('JUDGE')\").",
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
    @GetMapping({"/calibrations/{calibrationId}/score-sheet", "/calibration-rounds/{calibrationId}/score-sheet"})
    public ResponseEntity<CalibrationScoreSheetResponse> getScoreSheet(
            @Parameter(description = "Unique calibration identifier.", required = true)
            @PathVariable("calibrationId") UUID calibrationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getScoreSheet(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Submit Calibration Score",
            description = "Submit Calibration Score through POST /api/v1/calibrations/{calibrationId}/scores; POST /api/v1/calibration-rounds/{calibrationId}/scores. Successful execution returns HTTP 200 with List<CalibrationScoreResponse>. Access: SecurityConfig role JUDGE via matcher /api/v1/calibrations/*/scores; @PreAuthorize(\"hasRole('JUDGE')\"). Requires a SubmitCalibrationScoreRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Submit calibration score completed successfully.",
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
    @PostMapping({"/calibrations/{calibrationId}/scores", "/calibration-rounds/{calibrationId}/scores"})
    public ResponseEntity<List<CalibrationScoreResponse>> submitCalibrationScore(
            @Parameter(description = "Unique calibration identifier.", required = true)
            @PathVariable("calibrationId") UUID calibrationId,
            @Valid @RequestBody SubmitCalibrationScoreRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .submitCalibrationScores(calibrationId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @Operation(
            summary = "Get My Scores",
            description = "Get My Scores through GET /api/v1/calibrations/{calibrationId}/my-scores; GET /api/v1/calibration-rounds/{calibrationId}/my-scores. Successful execution returns HTTP 200 with List<CalibrationScoreResponse>. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('JUDGE')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my scores completed successfully.",
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
    @GetMapping({"/calibrations/{calibrationId}/my-scores", "/calibration-rounds/{calibrationId}/my-scores"})
    public ResponseEntity<List<CalibrationScoreResponse>> getMyScores(
            @Parameter(description = "Unique calibration identifier.", required = true)
            @PathVariable("calibrationId") UUID calibrationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getMyScores(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')")
    @Operation(
            summary = "Get Distribution",
            description = "Get Distribution through GET /api/v1/calibrations/{calibrationId}/distribution; GET /api/v1/calibration-rounds/{calibrationId}/distribution. Successful execution returns HTTP 200 with CalibrationDistributionResponse. Access: SecurityConfig roles JUDGE, COORDINATOR, ADMIN via matcher /api/v1/calibrations/**; @PreAuthorize(\"hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get distribution completed successfully.",
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
    @GetMapping({"/calibrations/{calibrationId}/distribution", "/calibration-rounds/{calibrationId}/distribution"})
    public ResponseEntity<CalibrationDistributionResponse> getDistribution(
            @Parameter(description = "Unique calibration identifier.", required = true)
            @PathVariable("calibrationId") UUID calibrationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getDistribution(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @PostMapping({"/calibrations/{calibrationId}/publish-distribution", "/calibration-rounds/{calibrationId}/publish-distribution"})
    public ResponseEntity<CalibrationRoundResponse> publishDistribution(
            @PathVariable("calibrationId") UUID calibrationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .publishDistribution(calibrationId, authentication));
    }
}
