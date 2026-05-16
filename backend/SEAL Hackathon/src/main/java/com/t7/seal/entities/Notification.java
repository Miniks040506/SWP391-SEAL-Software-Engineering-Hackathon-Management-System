package com.t7.seal.entities;

import com.t7.seal.domain.NotificationChannel;
import com.t7.seal.domain.NotificationStatus;
import com.t7.seal.domain.NotificationTargetScope;
import com.t7.seal.domain.NotificationType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "notifications",
        indexes = {
                @Index(name = "idx_notification_event", columnList = "event_id"),
                @Index(name = "idx_notification_created_by", columnList = "created_by"),
                @Index(name = "idx_notification_type", columnList = "type"),
                @Index(name = "idx_notification_target_scope", columnList = "target_scope"),
                @Index(name = "idx_notification_status", columnList = "status"),
                @Index(name = "idx_notification_scheduled_at", columnList = "scheduled_at"),
                @Index(name = "idx_notification_sent_at", columnList = "sent_at"),
                @Index(name = "idx_notification_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Notification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id")
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @Enumerated(EnumType.STRING)
    @Column(name = "type", nullable = false, length = 50)
    private NotificationType type;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "body", nullable = false, columnDefinition = "TEXT")
    private String body;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_scope", nullable = false, length = 50)
    private NotificationTargetScope targetScope;

    @Column(name = "target_id")
    private UUID targetId;

    @Enumerated(EnumType.STRING)
    @Column(name = "channel", nullable = false, length = 30)
    @Builder.Default
    private NotificationChannel channel = NotificationChannel.BOTH;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 50)
    @Builder.Default
    private NotificationStatus status = NotificationStatus.DRAFT;

    @Column(name = "failure_reason", columnDefinition = "TEXT")
    private String failureReason;

    @Column(name = "recipient_count")
    private Integer recipientCount;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validateTargetScope();
        applyDefaults();
    }

    private void validateRequiredFields() {
        if (createdBy == null) {
            throw new IllegalStateException("Notification creator is required.");
        }

        if (type == null) {
            throw new IllegalStateException("Notification type is required.");
        }

        if (title == null || title.isBlank()) {
            throw new IllegalStateException("Notification title is required.");
        }

        if (body == null || body.isBlank()) {
            throw new IllegalStateException("Notification body is required.");
        }

        if (targetScope == null) {
            throw new IllegalStateException("Notification target scope is required.");
        }
    }

    private void validateTargetScope() {
        if (targetScope == NotificationTargetScope.TRACK
                || targetScope == NotificationTargetScope.TEAM
                || targetScope == NotificationTargetScope.SINGLE_USER) {
            if (targetId == null) {
                throw new IllegalStateException(
                        "Target ID is required for TRACK, TEAM, and SINGLE_USER notification scopes."
                );
            }
        }
    }

    private void applyDefaults() {
        if (channel == null) {
            channel = NotificationChannel.BOTH;
        }

        if (status == null) {
            status = NotificationStatus.DRAFT;
        }

        if (recipientCount != null && recipientCount < 0) {
            recipientCount = 0;
        }
    }

    // Helper methods

    /**
     * Checks whether this is a system-level notification.
     */
    public boolean isSystemNotification() {
        return event == null;
    }

    /**
     * Checks whether this notification should be sent immediately.
     */
    public boolean isImmediate() {
        return scheduledAt == null;
    }

    /**
     * Checks whether this notification is scheduled for later.
     */
    public boolean isScheduled() {
        return scheduledAt != null;
    }

    /**
     * Checks whether this notification has already been sent successfully.
     */
    public boolean isSent() {
        return status == NotificationStatus.SENT;
    }

    /**
     * Checks whether this notification has failed completely.
     */
    public boolean isFailed() {
        return status == NotificationStatus.FAILED;
    }

    /**
     * Checks whether some recipients failed during sending.
     */
    public boolean isPartiallyFailed() {
        return status == NotificationStatus.PARTIALLY_FAILED;
    }

    /**
     * Checks whether this notification should be delivered in-app.
     */
    public boolean usesInAppChannel() {
        return channel == NotificationChannel.IN_APP
                || channel == NotificationChannel.BOTH;
    }

    /**
     * Checks whether this notification should be delivered by email.
     */
    public boolean usesEmailChannel() {
        return channel == NotificationChannel.EMAIL
                || channel == NotificationChannel.BOTH;
    }

    /**
     * Marks this notification as scheduled.
     */
    public void markScheduled(LocalDateTime scheduledAt) {
        if (scheduledAt == null) {
            throw new IllegalArgumentException("Scheduled time is required.");
        }

        this.scheduledAt = scheduledAt;
        this.status = NotificationStatus.SCHEDULED;
    }

    /**
     * Marks this notification as being processed.
     */
    public void markProcessing() {
        this.status = NotificationStatus.PROCESSING;
    }

    /**
     * Marks this notification as sent successfully.
     */
    public void markSent(int recipientCount) {
        this.status = NotificationStatus.SENT;
        this.sentAt = LocalDateTime.now();
        this.recipientCount = Math.max(recipientCount, 0);
        this.failureReason = null;
    }

    /**
     * Marks this notification as partially failed.
     */
    public void markPartiallyFailed(int recipientCount, String failureReason) {
        this.status = NotificationStatus.PARTIALLY_FAILED;
        this.sentAt = LocalDateTime.now();
        this.recipientCount = Math.max(recipientCount, 0);
        this.failureReason = failureReason;
    }

    /**
     * Marks this notification as failed.
     */
    public void markFailed(String failureReason) {
        this.status = NotificationStatus.FAILED;
        this.sentAt = LocalDateTime.now();
        this.failureReason = failureReason;
    }

}
