package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.ExportService;
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
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/events/{eventId}/exports")
@Tag(
        name = "Event Exports",
        description = "Create event ranking, score, and team-list exports."
)
public class EventExportController {

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Export Ranking",
            description = "Export Ranking through POST /api/v1/events/{eventId}/exports/ranking. Successful execution returns HTTP 200 with ExportJobResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/events/*/exports/**; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\"). Optionally accepts an EventExportRequest request body.",
            operationId = "eventExportExportRanking",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Export ranking completed successfully.",
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
    @PostMapping("/ranking")
    public ResponseEntity<ExportJobResponse> exportRanking(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventExportRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.exportEventRanking(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Export Scores",
            description = "Export Scores through POST /api/v1/events/{eventId}/exports/scores. Successful execution returns HTTP 200 with ExportJobResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/events/*/exports/**; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\"). Optionally accepts an EventExportRequest request body.",
            operationId = "eventExportExportScores",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Export scores completed successfully.",
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
    @PostMapping("/scores")
    public ResponseEntity<ExportJobResponse> exportScores(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventExportRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.exportEventScores(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/team-list")
    public ResponseEntity<ExportJobResponse> exportTeamList(
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventExportRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.exportEventTeamList(eventId, request, authentication));
    }
}