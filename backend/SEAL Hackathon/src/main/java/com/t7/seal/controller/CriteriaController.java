package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.criteria.CreateEventCriteriaRequest;
import com.t7.seal.request.criteria.CreateScoringCriteriaRequest;
import com.t7.seal.request.criteria.UpdateEventCriteriaRequest;
import com.t7.seal.request.criteria.UpdateScoringCriteriaRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.criteria.ScoringCriteriaResponse;
import com.t7.seal.service.CriteriaService;
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
        name = "Scoring Criteria",
        description = "Reusable criteria and event-specific criteria configuration."
)
public class CriteriaController {

    private final CriteriaService criteriaService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Scoring Criteria",
            description = "Get Scoring Criteria through GET /api/v1/criteria. Successful execution returns HTTP 200 with PageResponse<ScoringCriteriaResponse>. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "criteriaGetScoringCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get scoring criteria completed successfully.",
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
    @GetMapping("/criteria")
    public ResponseEntity<PageResponse<ScoringCriteriaResponse>> getScoringCriteria(
            @Parameter(description = "Is Active value. (optional)", required = false)
            @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Is Technical value. (optional)", required = false)
            @RequestParam(required = false) Boolean isTechnical,
            @Parameter(description = "Category value. (optional)", required = false)
            @RequestParam(required = false) String category,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(criteriaService.getScoringCriteria(
                isActive, isTechnical, category, page, size
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Create Scoring Criteria",
            description = "Create Scoring Criteria through POST /api/v1/criteria. Successful execution returns HTTP 201 with ScoringCriteriaResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\"). Requires a CreateScoringCriteriaRequest request body validated with Jakarta Bean Validation.",
            operationId = "criteriaCreateScoringCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create scoring criteria completed and the resource was created.",
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
    @PostMapping("/criteria")
    public ResponseEntity<ScoringCriteriaResponse> createScoringCriteria(
            @Valid @RequestBody CreateScoringCriteriaRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(criteriaService.createScoringCriteria(request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Scoring Criteria By Id",
            description = "Get Scoring Criteria By Id through GET /api/v1/criteria/{criteriaId}. Successful execution returns HTTP 200 with ScoringCriteriaResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria/*; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "criteriaGetScoringCriteriaById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get scoring criteria by id completed successfully.",
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
    @GetMapping("/criteria/{criteriaId}")
    public ResponseEntity<ScoringCriteriaResponse> getScoringCriteriaById(
            @Parameter(description = "Unique scoring criterion identifier.", required = true)
            @PathVariable UUID criteriaId
    ) {
        return ResponseEntity.ok(criteriaService.getScoringCriteriaById(criteriaId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Update Scoring Criteria",
            description = "Update Scoring Criteria through PATCH /api/v1/criteria/{criteriaId}. Successful execution returns HTTP 200 with ScoringCriteriaResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria/*; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\"). Requires an UpdateScoringCriteriaRequest request body validated with Jakarta Bean Validation.",
            operationId = "criteriaUpdateScoringCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update scoring criteria completed successfully.",
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
    @PatchMapping("/criteria/{criteriaId}")
    public ResponseEntity<ScoringCriteriaResponse> updateScoringCriteria(
            @Parameter(description = "Unique scoring criterion identifier.", required = true)
            @PathVariable UUID criteriaId,
            @Valid @RequestBody UpdateScoringCriteriaRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(criteriaService.updateScoringCriteria(criteriaId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Deactivate Scoring Criteria",
            description = "Deactivate Scoring Criteria through PATCH /api/v1/criteria/{criteriaId}/deactivate. Successful execution returns HTTP 200 with ScoringCriteriaResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria/*/deactivate; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "criteriaDeactivateScoringCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Deactivate scoring criteria completed successfully.",
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
    @PatchMapping("/criteria/{criteriaId}/deactivate")
    public ResponseEntity<ScoringCriteriaResponse> deactivateScoringCriteria(
            @Parameter(description = "Unique scoring criterion identifier.", required = true)
            @PathVariable UUID criteriaId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(criteriaService.deactivateScoringCriteria(criteriaId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Activate Scoring Criteria",
            description = "Activate Scoring Criteria through PATCH /api/v1/criteria/{criteriaId}/activate. Successful execution returns HTTP 200 with ScoringCriteriaResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria/*/activate; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "criteriaActivateScoringCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Activate scoring criteria completed successfully.",
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
    @PatchMapping("/criteria/{criteriaId}/activate")
    public ResponseEntity<ScoringCriteriaResponse> activateScoringCriteria(
            @Parameter(description = "Unique scoring criterion identifier.", required = true)
            @PathVariable UUID criteriaId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(criteriaService.activateScoringCriteria(criteriaId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Delete Scoring Criteria",
            description = "Delete Scoring Criteria through DELETE /api/v1/criteria/{criteriaId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/criteria/*; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "criteriaDeleteScoringCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Delete scoring criteria completed successfully with no response body."),
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
    @DeleteMapping("/criteria/{criteriaId}")
    public ResponseEntity<Void> deleteScoringCriteria(
            @Parameter(description = "Unique scoring criterion identifier.", required = true)
            @PathVariable UUID criteriaId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        criteriaService.deleteScoringCriteria(criteriaId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'JUDGE')")
    @Operation(
            summary = "Get Event Criteria",
            description = "Get Event Criteria through GET /api/v1/events/{eventId}/criteria. Successful execution returns HTTP 200 with List<EventCriteriaResponse>. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR', 'JUDGE')\").",
            operationId = "criteriaGetEventCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get event criteria completed successfully.",
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
    @GetMapping("/events/{eventId}/criteria")
    public ResponseEntity<List<EventCriteriaResponse>> getEventCriteria(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(description = "Is Active value. (optional)", required = false)
            @RequestParam(required = false) Boolean isActive,
            @Parameter(description = "Is Technical value. (optional)", required = false)
            @RequestParam(required = false) Boolean isTechnical
    ) {
        return ResponseEntity.ok(criteriaService.getEventCriteria(eventId, isActive, isTechnical));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @Operation(
            summary = "Create Event Criteria",
            description = "Create Event Criteria through POST /api/v1/events/{eventId}/criteria. Successful execution returns HTTP 201 with EventCriteriaResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/criteria; @PreAuthorize(\"hasRole('COORDINATOR')\"). Requires a CreateEventCriteriaRequest request body validated with Jakarta Bean Validation.",
            operationId = "criteriaCreateEventCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create event criteria completed and the resource was created.",
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
    @PostMapping("/events/{eventId}/criteria")
    public ResponseEntity<EventCriteriaResponse> createEventCriteria(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateEventCriteriaRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(criteriaService.createEventCriteria(eventId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @Operation(
            summary = "Update Event Criteria",
            description = "Update Event Criteria through PATCH /api/v1/event-criteria/{eventCriteriaId}. Successful execution returns HTTP 200 with EventCriteriaResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/event-criteria/*; @PreAuthorize(\"hasRole('COORDINATOR')\"). Requires an UpdateEventCriteriaRequest request body validated with Jakarta Bean Validation.",
            operationId = "criteriaUpdateEventCriteria",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update event criteria completed successfully.",
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
    @PatchMapping("/event-criteria/{eventCriteriaId}")
    public ResponseEntity<EventCriteriaResponse> updateEventCriteria(
            @Parameter(description = "Event Criteria Id value.", required = true)
            @PathVariable UUID eventCriteriaId,
            @Valid @RequestBody UpdateEventCriteriaRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(criteriaService.updateEventCriteria(eventCriteriaId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/event-criteria/{eventCriteriaId}")
    public ResponseEntity<Void> deleteEventCriteria(
            @PathVariable UUID eventCriteriaId,
            Authentication authentication
    ) {
        criteriaService.deleteEventCriteria(eventCriteriaId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'COORDINATOR')")
    @GetMapping("/rounds/{roundId}/criteria")
    public ResponseEntity<List<EventCriteriaResponse>> getCriteriaByRound(
            @PathVariable UUID roundId
    ) {
        return ResponseEntity.ok(criteriaService.getCriteriaByRound(roundId));
    }
}

