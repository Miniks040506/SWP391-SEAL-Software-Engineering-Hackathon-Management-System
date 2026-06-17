package com.t7.seal.entities;

import com.t7.seal.domain.EmailDeliveryStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "email_outbox",
        uniqueConstraints = {
                @UniqueConstraint(name = "uk_email_outbox_idempotency", columnNames = "idempotency_key")
        },
        indexes = {
                @Index(name = "idx_email_outbox_notification", columnList = "notification_id"),
                @Index(name = "idx_email_outbox_status", columnList = "status"),
                @Index(name = "idx_email_outbox_scheduled", columnList = "scheduled_at"),
                @Index(name = "idx_email_outbox_created", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmailOutbox {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "notification_id")
    private Notification notification;

    @Column(name = "to_email", nullable = false, length = 255)
    private String toEmail;

    @Column(name = "cc_emails", columnDefinition = "TEXT")
    private String ccEmails;

    @Column(name = "subject", nullable = false, length = 300)
    private String subject;

    @Column(name = "html_body", nullable = false, columnDefinition = "TEXT")
    private String htmlBody;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private EmailDeliveryStatus status = EmailDeliveryStatus.PENDING;

    @Column(name = "attempt_count", nullable = false)
    @Builder.Default
    private Integer attemptCount = 0;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Column(name = "sent_at")
    private LocalDateTime sentAt;

    @Column(name = "last_error", columnDefinition = "TEXT")
    private String lastError;

    @Column(name = "idempotency_key", nullable = false, length = 160)
    private String idempotencyKey;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public void markSent() {
        this.status = EmailDeliveryStatus.SENT;
        this.sentAt = LocalDateTime.now();
        this.lastError = null;
        this.attemptCount = this.attemptCount == null ? 1 : this.attemptCount + 1;
    }

    public void markFailed(String error) {
        this.status = EmailDeliveryStatus.FAILED;
        this.lastError = error;
        this.attemptCount = this.attemptCount == null ? 1 : this.attemptCount + 1;
    }
}
