package com.t7.seal.service;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import com.t7.seal.entities.HackathonEvent;
import com.t7.seal.entities.User;
import com.t7.seal.request.system.CreateNotificationRequest;
import com.t7.seal.request.system.TestEmailRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.NotificationResponse;
import com.t7.seal.response.system.UnreadCountResponse;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.UUID;

public interface NotificationService {
    NotificationResponse createNotification(CreateNotificationRequest request, Authentication authentication);

    NotificationResponse createSystemNotification(
            User actor,
            HackathonEvent event,
            NotificationType type,
            String title,
            String body,
            NotificationTargetScope targetScope,
            UUID targetId,
            String role,
            NotificationChannel channel,
            LocalDateTime scheduledAt
    );

    PageResponse<NotificationResponse> getMyNotifications(Boolean read, int page, int size, Authentication authentication);

    NotificationResponse getNotificationById(UUID notificationId, Authentication authentication);

    NotificationResponse sendNotificationNow(UUID notificationId, Authentication authentication);

    void markAsRead(UUID notificationId, Authentication authentication);

    void markAllAsRead(Authentication authentication);

    void deleteNotification(UUID notificationId, Authentication authentication);

    int clearMyNotifications(Boolean read, Authentication authentication);

    UnreadCountResponse getUnreadCount(Authentication authentication);

    void sendTestEmail(TestEmailRequest request, Authentication authentication);

    void dispatchDueNotifications();

    void dispatchQueuedEmails();
}
