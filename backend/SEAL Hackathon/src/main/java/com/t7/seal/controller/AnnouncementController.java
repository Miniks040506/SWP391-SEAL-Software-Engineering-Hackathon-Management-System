package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateAnnouncementRequest;
import com.t7.seal.request.system.UpdateAnnouncementRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.system.AnnouncementResponse;
import com.t7.seal.service.AnnouncementService;
import io.swagger.v3.oas.annotations.Operation;
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
        name = "Announcements",
        description = "Manage and publish event announcements."
)
public class AnnouncementController {
    private final AnnouncementService announcementService;

    @Operation(
            summary = "Get Event Announcements",
            description = "Get Event Announcements through GET /api/v1/events/{eventId}/announcements. Successful execution returns HTTP 200 with List<AnnouncementResponse>. Access: Public via SecurityConfig matcher /api/v1/events/*/announcements.",
            operationId = "announcementGetEventAnnouncements"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get event announcements completed successfully.",
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
    @GetMapping("/events/{eventId}/announcements")
    public ResponseEntity<List<AnnouncementResponse>> getEventAnnouncements(
            @PathVariable UUID eventId,
            @RequestParam(defaultValue = "false") boolean manage,
            Authentication authentication
    ) {
        if (manage) {
            return ResponseEntity.ok(announcementService.getManageEventAnnouncements(eventId, authentication));
        }
        return ResponseEntity.ok(announcementService.getEventAnnouncements(eventId));
    }

    @Operation(
            summary = "Create Announcement",
            description = "Create Announcement through POST /api/v1/events/{eventId}/announcements. Successful execution returns HTTP 201 with AnnouncementResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/announcements; @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\"). Requires a CreateAnnouncementRequest request body validated with Jakarta Bean Validation.",
            operationId = "announcementCreateAnnouncement",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create announcement completed and the resource was created.",
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
    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PostMapping("/events/{eventId}/announcements")
    public ResponseEntity<AnnouncementResponse> createAnnouncement(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateAnnouncementRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(announcementService.createAnnouncement(eventId, request, authentication));
    }

    @GetMapping("/announcements/{announcementId}")
    public ResponseEntity<AnnouncementResponse> getAnnouncementById(
            @PathVariable UUID announcementId,
            @RequestParam(defaultValue = "false") boolean manage,
            Authentication authentication
    ) {
        if (manage) {
            return ResponseEntity.ok(announcementService.getAnnouncementByIdForManage(announcementId, authentication));
        }
        return ResponseEntity.ok(announcementService.getAnnouncementById(announcementId));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PatchMapping("/announcements/{announcementId}")
    public ResponseEntity<AnnouncementResponse> updateAnnouncement(
            @PathVariable UUID announcementId,
            @Valid @RequestBody UpdateAnnouncementRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(announcementService
                .updateAnnouncement(announcementId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/announcements/{announcementId}")
    public ResponseEntity<Void> deleteAnnouncement(
            @PathVariable UUID announcementId,
            Authentication authentication
    ) {
        announcementService.deleteAnnouncement(announcementId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/announcements/{announcementId}/publish")
    public ResponseEntity<AnnouncementResponse> publishAnnouncement(
            @PathVariable UUID announcementId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                announcementService.publishAnnouncement(announcementId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/announcements/{announcementId}/schedule")
    public ResponseEntity<AnnouncementResponse> scheduleAnnouncement(
            @PathVariable UUID announcementId,
            @Valid @RequestBody UpdateAnnouncementRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                announcementService.scheduleAnnouncement(announcementId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/announcements/{announcementId}/unpublish")
    public ResponseEntity<AnnouncementResponse> unpublishAnnouncement(
            @PathVariable UUID announcementId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                announcementService.unpublishAnnouncement(announcementId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/announcements/{announcementId}/pin")
    public ResponseEntity<AnnouncementResponse> pinAnnouncement(
            @PathVariable UUID announcementId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                announcementService.pinAnnouncement(announcementId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/announcements/{announcementId}/unpin")
    public ResponseEntity<AnnouncementResponse> unpinAnnouncement(
            @PathVariable UUID announcementId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                announcementService.unpinAnnouncement(announcementId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/announcements/{announcementId}/mark-result")
    public ResponseEntity<AnnouncementResponse> markResultAnnouncement(
            @PathVariable UUID announcementId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(
                announcementService.markResultAnnouncement(announcementId, authentication));
    }
}
