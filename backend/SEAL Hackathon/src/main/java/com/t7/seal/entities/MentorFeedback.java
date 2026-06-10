package com.t7.seal.entities;

import com.t7.seal.domain.MentorFeedbackCategory;
import com.t7.seal.domain.MentorFeedbackVisibility;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "mentor_feedbacks",
        indexes = {
                @Index(name = "idx_mentor_feedback_team", columnList = "team_id"),
                @Index(name = "idx_mentor_feedback_mentor", columnList = "mentor_user_id"),
                @Index(name = "idx_mentor_feedback_submission", columnList = "submission_id"),
                @Index(name = "idx_mentor_feedback_visibility", columnList = "visibility")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MentorFeedback {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "mentor_user_id", nullable = false)
    private User mentor;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id")
    private Round round;

    @Column(columnDefinition = "TEXT")
    private String content;

    @Column(name = "is_visible_to_team", nullable = false)
    @Builder.Default
    private Boolean visibleToTeam = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private MentorFeedbackVisibility visibility = MentorFeedbackVisibility.DRAFT;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MentorFeedbackCategory category = MentorFeedbackCategory.GENERAL;

    @Column(name = "created_at", nullable = false, updatable = false)
    @CreationTimestamp
    private LocalDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    @UpdateTimestamp
    private LocalDateTime updatedAt;

    @Column(name = "published_at")
    private LocalDateTime publishedAt;

    // Checks whether this feedback is specific to a round.
    public boolean isRoundSpecific() {
        return round != null;
    }

    // Checks whether this feedback has enough meaningful content.
    public boolean hasValidContentLength() {
        return content != null && content.trim().length() >= 20;
    }

    public void publish(LocalDateTime now) {
        this.visibility = MentorFeedbackVisibility.PUBLISHED;
        this.visibleToTeam = true;
        this.updatedAt = now;
    }

    public boolean isPublished() {
        return visibility == MentorFeedbackVisibility.PUBLISHED;
    }

    @PrePersist
    @PreUpdate
    private void validate() {
        if (team == null) {
            throw new IllegalStateException("Team is required.");
        }

        if (mentor == null) {
            throw new IllegalStateException("Mentor is required.");
        }

        if (visibleToTeam == null) {
            visibleToTeam = false;
        }

        if (content == null || content.isBlank()) {
            throw new IllegalStateException("Feedback content is required.");
        }

        if (visibility == null) {
            visibility = MentorFeedbackVisibility.DRAFT;
        }

        if (category == null) {
            category = MentorFeedbackCategory.GENERAL;
        }
    }
}
