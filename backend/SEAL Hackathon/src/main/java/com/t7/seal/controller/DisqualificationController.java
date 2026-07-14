package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.CreateDisqualificationRequest;
import com.t7.seal.request.results.OverturnDisqualificationRequest;
import com.t7.seal.request.results.UpdateAppealRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.results.DisqualificationResponse;
import com.t7.seal.service.DisqualificationService;
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
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Disqualifications",
        description = "Disqualification, appeal, overturn, and active-case lookup."
)
public class DisqualificationController {

    private final DisqualificationService disqualificationService;

    @PreAuthorize("hasRole('COORDINATOR')")
    @Operation(
            summary = "Create Disqualification Submission",
            description = "Create Disqualification Submission through POST /api/v1/disqualifications. Successful execution returns HTTP 201 with DisqualificationResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/disqualifications; @PreAuthorize(\"hasRole('COORDINATOR')\"). Requires a CreateDisqualificationRequest request body validated with Jakarta Bean Validation.",
            operationId = "disqualificationCreateDisqualificationSubmission",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create disqualification submission completed and the resource was created.",
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
    @PostMapping("/disqualifications")
    public ResponseEntity<DisqualificationResponse> createDisqualificationSubmission(
            @Valid @RequestBody CreateDisqualificationRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(disqualificationService
                        .createDisqualificationSubmission(request, authentication));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN','STUDENT')")
    @Operation(
            summary = "Get Disqualification By Id",
            description = "Get Disqualification By Id through GET /api/v1/disqualifications/{disqualificationId}. Successful execution returns HTTP 200 with DisqualificationResponse. Access: SecurityConfig roles COORDINATOR, ADMIN, STUDENT via matcher /api/v1/disqualifications/*; @PreAuthorize(\"hasAnyRole('COORDINATOR','ADMIN','STUDENT')\").",
            operationId = "disqualificationGetDisqualificationById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get disqualification by id completed successfully.",
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
    @GetMapping("/disqualifications/{disqualificationId}")
    public ResponseEntity<DisqualificationResponse> getDisqualificationById(
            @Parameter(description = "Unique disqualification identifier.", required = true)
            @PathVariable UUID disqualificationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .getDisqualificationById(disqualificationId, authentication));
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'COORDINATOR')")
    @Operation(
            summary = "Update Appeal",
            description = "Update Appeal through PATCH /api/v1/disqualifications/{disqualificationId}/appeal. Successful execution returns HTTP 200 with DisqualificationResponse. Access: SecurityConfig roles STUDENT, COORDINATOR via matcher /api/v1/disqualifications/*/appeal; @PreAuthorize(\"hasAnyRole('STUDENT', 'COORDINATOR')\"). Requires an UpdateAppealRequest request body validated with Jakarta Bean Validation.",
            operationId = "disqualificationUpdateAppeal",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update appeal completed successfully.",
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
    @PatchMapping("/disqualifications/{disqualificationId}/appeal")
    public ResponseEntity<DisqualificationResponse> updateAppeal(
            @Parameter(description = "Unique disqualification identifier.", required = true)
            @PathVariable UUID disqualificationId,
            @Valid @RequestBody UpdateAppealRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .updateAppeal(disqualificationId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @Operation(
            summary = "Overturn Disqualification",
            description = "Overturn Disqualification through POST /api/v1/disqualifications/{disqualificationId}/overturn. Successful execution returns HTTP 200 with DisqualificationResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/disqualifications/*/overturn; @PreAuthorize(\"hasRole('COORDINATOR')\"). Requires an OverturnDisqualificationRequest request body validated with Jakarta Bean Validation.",
            operationId = "disqualificationOverturnDisqualification",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Overturn disqualification completed successfully.",
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
    @PostMapping("/disqualifications/{disqualificationId}/overturn")
    public ResponseEntity<DisqualificationResponse> overturnDisqualification(
            @Parameter(description = "Unique disqualification identifier.", required = true)
            @PathVariable UUID disqualificationId,
            @Valid @RequestBody OverturnDisqualificationRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .overturnDisqualification(disqualificationId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    @GetMapping("/events/{eventId}/disqualifications")
    public ResponseEntity<List<DisqualificationResponse>> getEventDisqualifications(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String appealStatus,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService.getDisqualificationsByEvent(
                eventId, roundId, trackId, appealStatus, authentication));
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'COORDINATOR', 'ADMIN')")
    @GetMapping("/teams/{teamId}/disqualifications/active")
    public ResponseEntity<List<DisqualificationResponse>> getActiveTeamDisqualifications(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .getActiveDisqualificationsByTeam(teamId, authentication));
    }
}
