package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.CreateNotificationRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.NotificationRecipientResolutionResponse;
import com.t7.seal.response.system.NotificationResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/notifications")
public class NotificationController {

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("recipients/resolve")
    public ResponseEntity<NotificationRecipientResolutionResponse> resolveRecipients(
            @RequestParam String targetScope,
            @RequestParam(required = false) String targetId,
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) String role
    ) {
        return null;
    }

    @PostMapping
    public ResponseEntity<NotificationResponse> createNotification(
            @Valid @RequestBody CreateNotificationRequest request
    ) {
        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<PageResponse<NotificationResponse>> getMyNotifications(
            @RequestParam(required = false) Boolean read,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @GetMapping("/{notificationId}")
    public ResponseEntity<NotificationResponse> getNotificationById(
            @PathVariable("notificationId") UUID notificationId
    ) {
        return null;
    }

    @PostMapping("/{notificationId}/send")
    public ResponseEntity<NotificationResponse> sendNotificationNow(
            @PathVariable("notificationId") UUID notificationId
    ) {
        return null;
    }

    @PostMapping("/{notificationId}/read")
    public ResponseEntity<Void> markAsRead(
            @PathVariable("notificationId") UUID notificationId
    ) {
        return null;
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllAsRead() {
        return null;
    }
}
