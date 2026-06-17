package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "notification_recipients",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_notification_recipient", columnNames = {"notification_id", "user_id"})
        },
        indexes = {
                @Index(name = "idx_notification_recipient_notification", columnList = "notification_id"),
                @Index(name = "idx_notification_recipient_user", columnList = "user_id"),
                @Index(name = "idx_notification_recipient_read", columnList = "read_at"),
                @Index(name = "idx_notification_recipient_created", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class NotificationRecipient {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "notification_id", nullable = false)
    private Notification notification;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "delivered_at")
    private LocalDateTime deliveredAt;

    @Column(name = "read_at")
    private LocalDateTime readAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public boolean isRead() {
        return readAt != null;
    }

    public void markDelivered() {
        if (deliveredAt == null) {
            deliveredAt = LocalDateTime.now();
        }
    }

    public void markRead() {
        if (readAt == null) {
            readAt = LocalDateTime.now();
        }
        markDelivered();
    }
}
