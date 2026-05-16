package com.t7.seal.entities;

import com.t7.seal.domain.CriteriaCategory;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "scoring_criteria")
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

    @PrePersist
    @PreUpdate
    private void applyDefaultTechnicalFlag() {
        if (isTechnical == null && category != null) {
            isTechnical = switch (category) {
                case TECHNICAL, PROCESS -> true;
                case PRESENTATION, INNOVATION, BUSINESS -> false;
            };
        }
    }
}
