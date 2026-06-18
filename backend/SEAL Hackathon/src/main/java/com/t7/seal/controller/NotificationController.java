package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateNotificationRequest;
import com.t7.seal.request.system.TestEmailRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.NotificationResponse;
import com.t7.seal.response.system.NotificationRecipientResolutionResponse;
import com.t7.seal.response.system.UnreadCountResponse;
import com.t7.seal.service.NotificationRecipientResolver;
import com.t7.seal.service.NotificationService;
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
public class NotificationController {

    private final NotificationRecipientResolver notificationRecipientResolver;
    private final NotificationService notificationService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/recipients/resolve")
    public ResponseEntity<NotificationRecipientResolutionResponse> resolveRecipients(
            @RequestParam String targetScope,
            @RequestParam(required = false) UUID targetId,
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) String role
    ) {
        return ResponseEntity.ok(notificationRecipientResolver.resolve(targetScope, targetId, eventId, role));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(notificationService.createNotification(request, authentication));
    }

    @GetMapping
    public ResponseEntity<PageResponse<NotificationResponse>> getMyNotificationsRoot(
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(read, page, size, authentication));
    }

    @GetMapping("/me")
    public ResponseEntity<PageResponse<NotificationResponse>> getMyNotifications(
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getMyNotifications(read, page, size, authentication));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<UnreadCountResponse> getUnreadCount(Authentication authentication) {
        return ResponseEntity.ok(notificationService.getUnreadCount(authentication));
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotificationById(
            @PathVariable("notificationId") UUID notificationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.getNotificationById(notificationId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/{notificationId}/send")
    public ResponseEntity<NotificationResponse> sendNotificationNow(
            @PathVariable("notificationId") UUID notificationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(notificationService.sendNotificationNow(notificationId, authentication));
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("notificationId") UUID notificationId,
            Authentication authentication
    ) {
        notificationService.markAsRead(notificationId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead(Authentication authentication) {
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
