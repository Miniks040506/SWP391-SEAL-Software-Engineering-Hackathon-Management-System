package com.t7.seal.entities;


import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "scores",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_score_submission_judge_criteria",
                        columnNames = {"submission_id", "judge_id", "event_criteria_id"}
                )
        },
        indexes = {
                @Index(name = "idx_score_submission", columnList = "submission_id"),
                @Index(name = "idx_score_judge", columnList = "judge_id"),
                @Index(name = "idx_score_event_criteria", columnList = "event_criteria_id"),
                @Index(name = "idx_score_is_draft", columnList = "is_draft"),
                @Index(name = "idx_score_scored_at", columnList = "scored_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Score {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Version
    @Column(name = "version", nullable = false)
    private Long version;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private Judge judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_criteria_id", nullable = false)
    private EventCriteria eventCriteria;

    @Column(name = "value", nullable = false)
    private Float value;

    @Column(name = "comment", columnDefinition = "TEXT")
    private String comment;

    /**
     * Whether this score is still a draft.
     * TRUE  = temporary saved score, not used for official ranking.
     * FALSE = confirmed score, used for ranking calculation.
     */
    @Column(name = "is_draft", nullable = false)
    @Builder.Default
    private Boolean isDraft = true;

    @CreationTimestamp
    @Column(name = "scored_at", nullable = false, updatable = false)
    private LocalDateTime scoredAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validateScoreValue();
    }

    private void validateRequiredFields() {
        if (submission == null) {
            throw new IllegalStateException("Submission is required.");
        }

        if (judge == null) {
            throw new IllegalStateException("Judge is required.");
        }

        if (eventCriteria == null) {
            throw new IllegalStateException("Event criteria is required.");
        }

        if (isDraft == null) {
            isDraft = true;
        }
    }

    private void validateScoreValue() {
        if (value == null) {
            throw new IllegalStateException("Score value is required.");
        }

        if (value < 0) {
            throw new IllegalStateException("Score value must be greater than or equal to 0.");
        }

        if (eventCriteria != null) {
            Float maxScore = eventCriteria.getEffectiveMaxScore();

            if (maxScore != null && value > maxScore) {
                throw new IllegalStateException(
                        "Score value must not exceed effective max score: " + maxScore
                );
            }
        }
    }

    // Helper methods


    // Checks whether this score has been confirmed.
    public boolean isConfirmed() {
        return Boolean.FALSE.equals(isDraft);
    }

    // Checks whether this score is still a draft.
    public boolean isDraftScore() {
        return Boolean.TRUE.equals(isDraft);
    }

    /**
     * Marks this score as confirmed.
     * Confirmed scores are used for official ranking calculation.
     */
    public void confirm() {
        this.isDraft = false;
    }

    // Marks this score as draft again.
    public void markAsDraft() {
        this.isDraft = true;
    }

    // Checks whether the judge has written a comment.
    public boolean hasComment() {
        return comment != null && !comment.isBlank();
    }

    /**
     * Calculates the weighted score value.
     * Formula: weighted_value = value * effective_weight
     */
    public Float getWeightedValue() {
        if (value == null || eventCriteria == null) {
            return null;
        }

        Float weight = eventCriteria.getEffectiveWeight();

        if (weight == null) {
            weight = 1.0f;
        }

        return value * weight;
    }


    // Returns the effective max score from EventCriteria.
    public Float getEffectiveMaxScore() {
        if (eventCriteria == null) {
            return null;
        }

        return eventCriteria.getEffectiveMaxScore();
    }


    // Checks whether this score reaches the maximum score.
    public boolean isMaxScore() {
        Float maxScore = getEffectiveMaxScore();

        return value != null
                && maxScore != null
                && Float.compare(value, maxScore) == 0;
    }
}
