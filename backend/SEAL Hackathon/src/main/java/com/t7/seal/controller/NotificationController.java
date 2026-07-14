package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateNotificationRequest;
import com.t7.seal.request.system.TestEmailRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.NotificationResponse;
import com.t7.seal.response.system.NotificationRecipientResolutionResponse;
import com.t7.seal.response.system.UnreadCountResponse;
import com.t7.seal.service.NotificationRecipientResolver;
import com.t7.seal.service.NotificationService;
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

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/notifications")
@Tag(
        name = "Notifications",
        description = "Notification inbox, dispatch, recipient resolution, and email testing."
)
public class NotificationController {

    private final NotificationRecipientResolver notificationRecipientResolver;
    private final NotificationService notificationService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Resolve Recipients",
            description = "Resolve Recipients through GET /api/v1/notifications/recipients/resolve. Successful execution returns HTTP 200 with NotificationRecipientResolutionResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/notifications/recipients/resolve; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "notificationResolveRecipients",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Resolve recipients completed successfully.",
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
    @GetMapping("/recipients/resolve")
    public ResponseEntity<NotificationRecipientResolutionResponse> resolveRecipients(
            @Parameter(description = "Target Scope value.", required = true)
            @RequestParam String targetScope,
            @Parameter(description = "Target Id value. (optional)", required = false)
            @RequestParam(required = false) UUID targetId,
            @Parameter(description = "Unique event identifier. (optional)", required = false)
            @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Role value. (optional)", required = false)
            @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(notificationRecipientResolver.resolve(targetScope, targetId, eventId, role));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Create Notification",
            description = "Create Notification through POST /api/v1/notifications. Successful execution returns HTTP 201 with NotificationResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/notifications; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\"). Requires a CreateNotificationRequest request body validated with Jakarta Bean Validation.",
            operationId = "notificationCreateNotification",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create notification completed and the resource was created.",
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
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request, authentication));
    }

    @Operation(
            summary = "Get My Notifications Root",
            description = "Get My Notifications Root through GET /api/v1/notifications. Successful execution returns HTTP 200 with PageResponse<NotificationResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/notifications/**.",
            operationId = "notificationGetMyNotificationsRoot",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my notifications root completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getMyNotificationsRoot(
            @Parameter(description = "Read value. (optional)", required = false)
            @RequestParam(required = false) Boolean read,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(read, page, size, authentication));
    }

    @Operation(
            summary = "Get My Notifications",
            description = "Get My Notifications through GET /api/v1/notifications/me. Successful execution returns HTTP 200 with PageResponse<NotificationResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/notifications/**.",
            operationId = "notificationGetMyNotifications",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my notifications completed successfully.",
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/me")
    public ResponseEntity<PageResponse<NotificationResponse>> getMyNotifications(
            @Parameter(description = "Read value. (optional)", required = false)
            @RequestParam(required = false) Boolean read,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(read, page, size, authentication));
    }

    @Operation(
            summary = "Get Unread Count",
            description = "Get Unread Count through GET /api/v1/notifications/unread-count. Successful execution returns HTTP 200 with UnreadCountResponse. Access: Authenticated via SecurityConfig matcher /api/v1/notifications/**.",
            operationId = "notificationGetUnreadCount",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get unread count completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getUnreadCount(authentication));
    }

    @Operation(
            summary = "Get Notification By Id",
            description = "Get Notification By Id through GET /api/v1/notifications/{notificationId}. Successful execution returns HTTP 200 with NotificationResponse. Access: Authenticated via SecurityConfig matcher /api/v1/notifications/**.",
            operationId = "notificationGetNotificationById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get notification by id completed successfully.",
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
    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotificationById(
            @Parameter(description = "Notification Id value.", required = true)
            @PathVariable UUID notificationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getNotificationById(notificationId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Send Notification Now",
            description = "Send Notification Now through POST /api/v1/notifications/{notificationId}/send. Successful execution returns HTTP 200 with NotificationResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/notifications/*/send; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\").",
            operationId = "notificationSendNotificationNow",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Send notification now completed successfully.",
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
    @PostMapping("/{notificationId}/send")
    public ResponseEntity<NotificationResponse> sendNotificationNow(
            @Parameter(description = "Notification Id value.", required = true)
            @PathVariable UUID notificationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.sendNotificationNow(notificationId, authentication));
    }

    @Operation(
            summary = "Mark As Read",
            description = "Mark As Read through POST /api/v1/notifications/{notificationId}/read. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher /api/v1/notifications/**.",
            operationId = "notificationMarkAsRead",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Mark as read completed successfully with no response body."),
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
    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @Parameter(description = "Notification Id value.", required = true)
            @PathVariable UUID notificationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        notificationService.markAsRead(notificationId, authentication);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Mark All As Read",
            description = "Mark All As Read through POST /api/v1/notifications/read-all. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher /api/v1/notifications/**.",
            operationId = "notificationMarkAllAsRead",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Mark all as read completed successfully with no response body."),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
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
    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(
            @Parameter(hidden = true) Authentication authentication
    ) {
        notificationService.markAllAsRead(authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{notificationId}")
    public ResponseEntity<Void> deleteNotification(
            @PathVariable("notificationId") UUID notificationId,
            Authentication authentication
    ) {
        notificationService.deleteNotification(notificationId, authentication);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/clear")
    public ResponseEntity<Void> clearNotifications(
            @RequestParam(required = false) Boolean read,
            Authentication authentication
    ) {
        notificationService.clearMyNotifications(read, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/test-email")
    public ResponseEntity<Void> sendTestEmail(
            @Valid @RequestBody TestEmailRequest request,
            Authentication authentication
    ) {
        notificationService.sendTestEmail(request, authentication);
        return ResponseEntity.noContent().build();
    }
}
