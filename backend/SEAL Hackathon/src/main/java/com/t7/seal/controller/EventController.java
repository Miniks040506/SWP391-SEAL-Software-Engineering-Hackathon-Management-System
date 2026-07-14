package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.event.UpdateEventRequest;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.request.event.CreateEventRequest;
import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.UploadFileResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import com.t7.seal.service.CloudinaryStorageService;
import com.t7.seal.service.EventService;
import com.t7.seal.service.RankingService;
import com.t7.seal.service.RblResearchService;
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
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/events")
@RequiredArgsConstructor
@Tag(
        name = "Events",
        description = "Event lifecycle, public discovery, result publication, and RBL entry points."
)
public class EventController {

    private final EventService eventService;
    private final RankingService rankingService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final RblResearchService rblResearchService;

    @PreAuthorize("@eventSecurity.canCreateEvent(authentication)")
    @Operation(
            summary = "Upload Event Banner",
            description = "Upload Event Banner through POST /api/v1/events/banner. Successful execution returns HTTP 200 with UploadFileResponse. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"@eventSecurity.canCreateEvent(authentication)\"). Consumes MediaType.MULTIPART_FORM_DATA_VALUE.",
            operationId = "eventUploadEventBanner",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Upload event banner completed successfully.",
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
                    responseCode = "413",
                    description = "The uploaded file exceeds the configured size limit.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "415",
                    description = "The uploaded media type is not supported.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping(
            value = "/banner",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UploadFileResponse> uploadEventBanner(
            @Parameter(description = "Uploaded binary file.", required = true)
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                new UploadFileResponse(
                        cloudinaryStorageService.uploadEventBanner(file)));
    }

    @PreAuthorize("@eventSecurity.canCreateEvent(authentication)")
    @Operation(
            summary = "Create Event",
            description = "Create Event through POST /api/v1/events. Successful execution returns HTTP 201 with EventDetailResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events; @PreAuthorize(\"@eventSecurity.canCreateEvent(authentication)\"). Requires a CreateEventRequest request body validated with Jakarta Bean Validation.",
            operationId = "eventCreateEvent",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create event completed and the resource was created.",
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
    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        EventDetailResponse response = eventService.createEvent(request, authentication);
//        return new ResponseEntity<>(response, HttpStatus.CREATED);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // 2 method to create response
    }

    @Operation(
            summary = "Get Public Events",
            description = "Get Public Events through GET /api/v1/events. Successful execution returns HTTP 200 with PageResponse<EventSummaryResponse>. Access: Public via SecurityConfig matcher /api/v1/events.",
            operationId = "eventGetPublicEvents"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get public events completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping
    public ResponseEntity<PageResponse<EventSummaryResponse>> getPublicEvents(
            @Parameter(description = "Optional event-season filter. (optional)", required = false)
            @RequestParam(required = false) String season,
            @Parameter(description = "Optional event-year filter. (optional)", required = false)
            @RequestParam(required = false) Integer year,
            @Parameter(description = "Optional status filter. (optional)", required = false)
            @RequestParam(required = false) String status,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 6, optional)", required = false)
            @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(eventService.getPublicEvent(season, year, status, size, page));
    }

    @Operation(
            summary = "Get All Events",
            description = "Get All Events through GET /api/v1/events/all. Successful execution returns HTTP 200 with PageResponse<EventSummaryResponse>. Access: Public via SecurityConfig matcher /api/v1/events/*.",
            operationId = "eventGetAllEvents"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get all events completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/all")
    public ResponseEntity<PageResponse<EventSummaryResponse>> getAllEvents(
            @Parameter(description = "Optional event-season filter. (optional)", required = false)
            @RequestParam(required = false) String season,
            @Parameter(description = "Optional event-year filter. (optional)", required = false)
            @RequestParam(required = false) Integer year,
            @Parameter(description = "Optional status filter. (optional)", required = false)
            @RequestParam(required = false) String status,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 6, optional)", required = false)
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(eventService.getAllEvents(season, year, status, size, page));
    }

    @Operation(
            summary = "Get Event By Id",
            description = "Get Event By Id through GET /api/v1/events/{eventId}. Successful execution returns HTTP 200 with EventDetailResponse. Access: Public via SecurityConfig matcher /api/v1/events/*.",
            operationId = "eventGetEventById"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get event by id completed successfully.",
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
    @GetMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> getEventById(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.getEventById(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @Operation(
            summary = "Update Event",
            description = "Update Event through PATCH /api/v1/events/{eventId}. Successful execution returns HTTP 202 with EventDetailResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*; @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\"). Requires an UpdateEventRequest request body validated with Jakarta Bean Validation.",
            operationId = "eventUpdateEvent",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "202",
                    description = "Update event was accepted for processing.",
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
    @PatchMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> updateEvent(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateEventRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        EventDetailResponse ev = eventService.updateEvent(eventId, request, authentication);
        return ResponseEntity.accepted().body(ev);
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @Operation(
            summary = "Advance Event Status",
            description = "Advance Event Status through POST /api/v1/events/{eventId}/advance-status. Successful execution returns HTTP 200 with EventDetailResponse. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\").",
            operationId = "eventAdvanceEventStatus",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Advance event status completed successfully.",
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
    @PostMapping("/{eventId}/advance-status")
    public ResponseEntity<EventDetailResponse> advanceEventStatus(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.advanceEventStatus(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @Operation(
            summary = "Cancel Event",
            description = "Cancel Event through POST /api/v1/events/{eventId}/cancel. Successful execution returns HTTP 200 with EventDetailResponse. Access: Authenticated via SecurityConfig matcher anyRequest(); @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\").",
            operationId = "eventCancelEvent",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Cancel event completed successfully.",
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
    @PostMapping("/{eventId}/cancel")
    public ResponseEntity<EventDetailResponse> cancelEvent(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.cancelEvent(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID eventId,
            Authentication authentication) {
        eventService.deleteEvent(eventId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/ranking")
    public ResponseEntity<List<RankingResponse>> getEventRanking(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PostMapping("/{eventId}/publish-results")
    public ResponseEntity<PublishResultsResponse> publishResults(
            @PathVariable UUID eventId,
            @Valid @RequestBody(required = false) PublishResultsRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.publishEventResults(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{eventId}/variance-dashboard")
    public ResponseEntity<VarianceDashboardResponse> getVarianceDashboard(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String criteriaType,
            @RequestParam(required = false) String judgeType,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rblResearchService.getVarianceDashboard(
                eventId,
                roundId,
                trackId,
                criteriaType,
                judgeType,
                authentication
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/{eventId}/exports/rbl-dataset")
    public ResponseEntity<ExportJobResponse> exportRblDataset(
            @PathVariable UUID eventId,
            @RequestBody(required = false) ExportRblDatasetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rblResearchService.exportAnonymizedDataset(eventId, request, authentication));
    }
}
