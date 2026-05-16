package com.t7.seal.entities;

import com.t7.seal.infrastructure.UUIDListJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "event_criteria",
        indexes = {
                @Index(name = "idx_event_criteria_event", columnList = "event_id"),
                @Index(name = "idx_event_criteria_template", columnList = "criteria_id"),
                @Index(name = "idx_event_criteria_active", columnList = "is_active"),
                @Index(name = "idx_event_criteria_order", columnList = "display_order")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EventCriteria {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "criteria_id")
    private ScoringCriteria criteria;

    @Column(name = "name_override", length = 200)
    private String nameOverride;

    @Column(name = "description_override", columnDefinition = "TEXT")
    private String descriptionOverride;

    @Column(name = "rubric_override", columnDefinition = "TEXT")
    private String rubricOverride;

    @Column(name = "weight_override")
    private Float weightOverride;

    @Column(name = "max_score_override")
    private Float maxScoreOverride;

    @Column(name = "is_technical_override")
    private Boolean isTechnicalOverride;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @Convert(converter = UUIDListJsonConverter.class)
    @Column(name = "applies_to_round_ids", columnDefinition = "TEXT")
    private List<UUID> appliesToRoundIds;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @OneToMany(mappedBy = "eventCriteria")
    private List<Score> scores;

    @OneToMany(mappedBy = "eventCriteria")
    private List<CalibrationScore> calibrationScores;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateCustomCriteria();
        validateScoreConfig();
    }

    private void validateCustomCriteria() {
        if (criteria == null) {
            if (nameOverride == null || nameOverride.isBlank()) {
                throw new IllegalStateException(
                        "Custom EventCriteria must have nameOverride."
                );
            }

            if (isTechnicalOverride == null) {
                throw new IllegalStateException(
                        "Custom EventCriteria must define isTechnicalOverride."
                );
            }
        }
    }

    private void validateScoreConfig() {
        if (weightOverride != null && weightOverride < 0) {
            throw new IllegalStateException(
                    "EventCriteria weightOverride must be greater than or equal to 0."
            );
        }

        if (maxScoreOverride != null && maxScoreOverride <= 0) {
            throw new IllegalStateException(
                    "EventCriteria maxScoreOverride must be greater than 0."
            );
        }
    }

    // Effective value helper methods

    public String getEffectiveName() {
        if (nameOverride != null && !nameOverride.isBlank()) {
            return nameOverride;
        }

        return criteria != null ? criteria.getName() : null;
    }

    public String getEffectiveDescription() {
        if (descriptionOverride != null && !descriptionOverride.isBlank()) {
            return descriptionOverride;
        }

        return criteria != null ? criteria.getDescription() : null;
    }

    public String getEffectiveRubric() {
        if (rubricOverride != null && !rubricOverride.isBlank()) {
            return rubricOverride;
        }

        return criteria != null ? criteria.getRubric() : null;
    }

    public Float getEffectiveWeight() {
        if (weightOverride != null) {
            return weightOverride;
        }

        if (criteria != null) {
            return criteria.getDefaultWeight();
        }

        return 1.0f;
    }

    public Float getEffectiveMaxScore() {
        if (maxScoreOverride != null) {
            return maxScoreOverride;
        }

        if (criteria != null) {
            return criteria.getMaxScore();
        }

        return 10.0f;
    }

    public Boolean getEffectiveIsTechnical() {
        if (isTechnicalOverride != null) {
            return isTechnicalOverride;
        }

        return criteria != null ? criteria.getIsTechnical() : null;
    }

    // Helper methods

    public boolean isCustomCriteria() {
        return criteria == null;
    }

    public boolean isTemplateBasedCriteria() {
        return criteria != null;
    }

    public boolean isActiveCriteria() {
        return Boolean.TRUE.equals(isActive);
    }

    public boolean isInactiveCriteria() {
        return Boolean.FALSE.equals(isActive);
    }

    public boolean appliesToAllRounds() {
        return appliesToRoundIds == null || appliesToRoundIds.isEmpty();
    }

    public boolean appliesToRound(UUID roundId) {
        if (roundId == null) {
            return false;
        }

        return appliesToAllRounds() || appliesToRoundIds.contains(roundId);
    }

    public boolean isEffectiveTechnicalCriteria() {
        return Boolean.TRUE.equals(getEffectiveIsTechnical());
    }

    public boolean isEffectiveSoftCriteria() {
        return Boolean.FALSE.equals(getEffectiveIsTechnical());
    }

    public void deactivate() {
        this.isActive = false;
    }

    public void activate() {
        this.isActive = true;
    }
}