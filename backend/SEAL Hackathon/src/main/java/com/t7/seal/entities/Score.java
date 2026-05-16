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
                @Index(name = "idx_score_is_draft", columnList = "is_draft")
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

    //TRUE = draft score, Judge has not confirmed.
    //FALSE = confirmed score, used to calculate the official ranking.
    @Column(name = "is_draft", nullable = false)
    @Builder.Default
    private Boolean isDraft = true;

    @CreationTimestamp
    @Column(name = "scored_at", nullable = false, updatable = false)
    private LocalDateTime scoredAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Helper methods

    public boolean isConfirmed() {
        return Boolean.FALSE.equals(isDraft);
    }

    public boolean isDraftScore() {
        return Boolean.TRUE.equals(isDraft);
    }

    public void confirm() {
        this.isDraft = false;
    }

    public void markAsDraft() {
        this.isDraft = true;
    }

    public boolean hasComment() {
        return comment != null && !comment.isBlank();
    }

    // calculate score
    // weighted_score = value * effective_weight
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
}
