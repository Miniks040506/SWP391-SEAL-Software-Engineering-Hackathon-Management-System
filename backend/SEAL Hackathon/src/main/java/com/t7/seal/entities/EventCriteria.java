package com.t7.seal.entities;

import com.t7.seal.infrastructure.UUIDListJsonConverter;
import jakarta.persistence.*;
import lombok.*;

import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "event_criteria")
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
        return criteria != null ? criteria.getDefaultWeight() : null;
    }

    public Float getEffectiveMaxScore() {
        if (maxScoreOverride != null) {
            return maxScoreOverride;
        }
        return criteria != null ? criteria.getMaxScore() : null;
    }

    public Boolean getEffectiveIsTechnical() {
        if (isTechnicalOverride != null) {
            return isTechnicalOverride;
        }
        return criteria != null ? criteria.getIsTechnical() : null;
    }

    public boolean appliesToAllRounds() {
        return appliesToRoundIds == null || appliesToRoundIds.isEmpty();
    }
}