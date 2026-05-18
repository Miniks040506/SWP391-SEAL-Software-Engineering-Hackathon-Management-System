package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "event_announcements",
        indexes = {
                @Index(name = "idx_event_announcement_event", columnList = "event_id"),
                @Index(name = "idx_event_announcement_created_by", columnList = "created_by"),
                @Index(name = "idx_event_announcement_published_at", columnList = "published_at"),
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

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by", nullable = false)
    private User createdBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        applyDefaults();
    }

    private void validateRequiredFields() {
        if (event == null) {
            throw new IllegalStateException("Event is required.");
        }

        if (createdBy == null) {
            throw new IllegalStateException("Created by user is required.");
        }

        if (title == null || title.isBlank()) {
            throw new IllegalStateException("Announcement title is required.");
        }

        if (content == null || content.isBlank()) {
            throw new IllegalStateException("Announcement content is required.");
        }
    }

    private void applyDefaults() {
        if (isPinned == null) {
            isPinned = false;
        }

        if (isResultAnnouncement == null) {
            isResultAnnouncement = false;
        }
    }

    // Helper methods

    // Checks whether this announcement is still a draft.
    public boolean isDraft() {
        return publishedAt == null;
    }


    // Checks whether this announcement has been published.
    public boolean isPublished() {
        return publishedAt != null;
    }


    // Checks whether this announcement is pinned.
    public boolean isPinnedAnnouncement() {
        return Boolean.TRUE.equals(isPinned);
    }


    // Checks whether this announcement is the official result announcement.
    public boolean isOfficialResultAnnouncement() {
        return Boolean.TRUE.equals(isResultAnnouncement);
    }

    /**
     * Publishes this announcement.
     * Published announcements are visible on the event page.
     */
    public void publish() {
        this.publishedAt = LocalDateTime.now();
    }

    /**
     * Converts this announcement back to draft.
     * The service layer should check whether unpublishing is allowed.
     */
    public void unpublish() {
        this.publishedAt = null;
    }


    // Pins this announcement to the top of the event page.
    public void pin() {
        this.isPinned = true;
    }


    // Removes this announcement from the pinned section.
    public void unpin() {
        this.isPinned = false;
    }


    // Marks this announcement as the official result announcement.
    public void markAsResultAnnouncement() {
        this.isResultAnnouncement = true;
    }


    // Removes the official result announcement marker.
    public void unmarkAsResultAnnouncement() {
        this.isResultAnnouncement = false;
    }
}
