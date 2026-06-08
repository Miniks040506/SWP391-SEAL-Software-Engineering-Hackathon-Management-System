package com.t7.seal.entities;

import com.t7.seal.domain.EventAnnouncementStatus;
import com.t7.seal.domain.NotificationTargetScope;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "event_announcements",
        indexes = {
                @Index(name = "idx_event_announcement_event", columnList = "event_id"),
                @Index(name = "idx_event_announcement_created_by", columnList = "created_by"),
                @Index(name = "idx_event_announcement_published_at", columnList = "published_at"),
                @Index(name = "idx_event_announcement_status", columnList = "status"),
                @Index(name = "idx_event_announcement_scheduled_at", columnList = "scheduled_at"),
                @Index(name = "idx_event_announcement_is_pinned", columnList = "is_pinned"),
                @Index(name = "idx_event_announcement_is_result", columnList = "is_result_announcement")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventAnnouncement {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @Column(name = "title", nullable = false, length = 300)
    private String title;

    @Column(name = "content", nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_pinned", nullable = false)
    @Builder.Default
    private Boolean isPinned = false;

    @Column(name = "is_result_announcement", nullable = false)
    @Builder.Default
    private Boolean isResultAnnouncement = false;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    @Column(name = "scheduled_at")
    private LocalDateTime scheduledAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private EventAnnouncementStatus status = EventAnnouncementStatus.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(name = "target_scope", nullable = false, length = 50)
    @Builder.Default
    private NotificationTargetScope targetScope = NotificationTargetScope.ALL;

    @Column(name = "target_id")
    private UUID targetId;

    @ElementCollection
    @CollectionTable(name = "announcement_target_tracks", joinColumns = @JoinColumn(name = "announcement_id"))
    @Column(name = "track_id")
    @Builder.Default
    private List<UUID> targetTrackIds = new ArrayList<>();

    @ElementCollection
    @CollectionTable(name = "announcement_target_roles", joinColumns = @JoinColumn(name = "announcement_id"))
    @Column(name = "role_name", length = 50)
    @Builder.Default
    private List<String> targetRoleNames = new ArrayList<>();

    @Column(name = "send_email", nullable = false)
    @Builder.Default
    private Boolean sendEmail = false;

    @Column(name = "send_in_app", nullable = false)
    @Builder.Default
    private Boolean sendInApp = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @PrePersist
    @PreUpdate
    private void validate() {
        if (event == null) { throw new IllegalStateException("Event is required."); }
        if (createdBy == null) { throw new IllegalStateException("Created by user is required."); }
        if (title == null || title.isBlank()) { throw new IllegalStateException("Announcement title is required."); }
        if (content == null || content.isBlank()) { throw new IllegalStateException("Announcement content is required."); }
        if (isPinned == null) { isPinned = false; }
        if (isResultAnnouncement == null) { isResultAnnouncement = false; }
        if (sendEmail == null) { sendEmail = false; }
        if (sendInApp == null) { sendInApp = true; }
        if (status == null) { status = EventAnnouncementStatus.DRAFT; }
        if (targetScope == null) { targetScope = NotificationTargetScope.ALL; }
        if (targetTrackIds == null) { targetTrackIds = new ArrayList<>(); }
        if (targetRoleNames == null) { targetRoleNames = new ArrayList<>(); }
    }

    public boolean isDraft() { return status == EventAnnouncementStatus.DRAFT; }
    public boolean isPublished() { return status == EventAnnouncementStatus.PUBLISHED; }
    public boolean isScheduled() { return status == EventAnnouncementStatus.SCHEDULED; }
    public boolean isCancelled() { return status == EventAnnouncementStatus.CANCELLED; }

    public void publish(LocalDateTime now) {
        this.publishedAt = now == null ? LocalDateTime.now() : now;
        this.scheduledAt = null;
        this.status = EventAnnouncementStatus.PUBLISHED;
    }

    public void schedule(LocalDateTime when) {
        if (when == null) { throw new IllegalArgumentException("Scheduled time is required."); }
        if (!when.isAfter(LocalDateTime.now())) { throw new IllegalArgumentException("Scheduled time must be in the future."); }
        this.scheduledAt = when;
        this.status = EventAnnouncementStatus.SCHEDULED;
        this.publishedAt = null;
    }

    public void unpublish() {
        this.publishedAt = null;
        this.status = EventAnnouncementStatus.DRAFT;
    }

    public void cancel() { this.status = EventAnnouncementStatus.CANCELLED; }
    public void pin() { this.isPinned = true; }
    public void unpin() { this.isPinned = false; }
    public void markAsResultAnnouncement() { this.isResultAnnouncement = true; }
    public void unmarkAsResultAnnouncement() { this.isResultAnnouncement = false; }
}
