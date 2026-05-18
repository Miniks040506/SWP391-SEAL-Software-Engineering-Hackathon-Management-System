package com.t7.seal.entities;

import com.t7.seal.domain.CriteriaCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "scoring_criteria",
        indexes = {
                @Index(name = "idx_scoring_criteria_category", columnList = "category"),
                @Index(name = "idx_scoring_criteria_is_technical", columnList = "is_technical"),
                @Index(name = "idx_scoring_criteria_is_default", columnList = "is_default"),
                @Index(name = "idx_scoring_criteria_is_active", columnList = "is_active")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ScoringCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "name", nullable = false, length = 200)
    private String name;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "rubric", columnDefinition = "TEXT")
    private String rubric;

    @Column(name = "max_score", nullable = false)
    @Builder.Default
    private Float maxScore = 10.0f;

    @Column(name = "default_weight", nullable = false)
    @Builder.Default
    private Float defaultWeight = 1.0f;

    @Enumerated(EnumType.STRING)
    @Column(name = "category", nullable = false, length = 50)
    private CriteriaCategory category;

    /**
     * TRUE: technical criteria, code, architecture, performance, process
     * FALSE: presentation, business, innovation, subjective criteria
     */
    @Column(name = "is_technical", nullable = false)
    private Boolean isTechnical;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private Boolean isDefault = true;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /**
     * A ScoringCriteria template can be used by multiple EventCriteria.
     * ScoringCriteria is not directly linked to Score.
     * Score will reference EventCriteria.
     */
    @OneToMany(mappedBy = "criteria")
    private List<EventCriteria> eventCriteriaList;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validateAndApplyDefaults() {
        validateRequiredFields();
        validateScores();
        applyDefaultTechnicalFlagIfNeeded();
    }

    private void validateRequiredFields() {
        if (name == null || name.isBlank()) {
            throw new IllegalStateException("Scoring criteria name is required.");
        }

        if (category == null) {
            throw new IllegalStateException("Scoring criteria category is required.");
        }
    }

    private void validateScores() {
        if (maxScore == null || maxScore <= 0) {
            throw new IllegalStateException("Max score must be greater than 0.");
        }

        if (defaultWeight == null || defaultWeight < 0) {
            throw new IllegalStateException("Default weight must be greater than or equal to 0.");
        }
    }

    private void applyDefaultTechnicalFlagIfNeeded() {
        if (isTechnical == null && category != null) {
            isTechnical = switch (category) {
                case TECHNICAL, PROCESS -> true;
                case PRESENTATION, INNOVATION, BUSINESS -> false;
            };
        }
    }

    // Helper methods

    public boolean isTechnicalCriteria() {
        return Boolean.TRUE.equals(isTechnical);
    }

    public boolean isSoftCriteria() {
        return Boolean.FALSE.equals(isTechnical);
    }

    public boolean isDeprecated() {
        return Boolean.FALSE.equals(isActive);
    }

    public boolean shouldApplyByDefault() {
        return Boolean.TRUE.equals(isDefault) && Boolean.TRUE.equals(isActive);
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void activate() {
        this.isActive = true;
    }
}

