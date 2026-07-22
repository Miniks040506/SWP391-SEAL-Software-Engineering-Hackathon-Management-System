package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
        name = "calibration_rounds",
        indexes = {
                @Index(name = "idx_calibration_round_event", columnList = "event_id"),
                @Index(name = "idx_calibration_round_sample_submission", columnList = "sample_submission_id"),
                @Index(name = "idx_calibration_round_start_end", columnList = "start_at, end_at"),
                @Index(name = "idx_calibration_round_distribution_published", columnList = "distribution_published_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalibrationRound {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "sample_submission_id", nullable = false)
    private Submission sampleSubmission;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "benchmark_scores", columnDefinition = "jsonb")
    private Map<String, Float> benchmarkScores;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_at", nullable = false)
    private LocalDateTime startAt;

    @Column(name = "end_at", nullable = false)
    private LocalDateTime endAt;

    /**
     * TRUE means judges must complete calibration before scoring
     * real submissions.
     */
    @Column(name = "is_mandatory", nullable = false)
    @Builder.Default
    private Boolean isMandatory = true;

    /**
     * The time when the coordinator published the distribution chart.
     * NULL means the distribution chart has not been published yet.
     */
    @Column(name = "distribution_published_at")
    private LocalDateTime distributionPublishedAt;

    /**
     * Calibration scores submitted by judges.
     * These scores are separate from official Score records.
     * They are used for calibration analysis and variance comparison.
     */
    @OneToMany(
            mappedBy = "calibrationRound",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<CalibrationScore> calibrationScores;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validateTimeRange();
        applyDefaults();
    }

    private void validateRequiredFields() {
        if (event == null) {
            throw new IllegalStateException("Event is required.");
        }

        if (sampleSubmission == null) {
            throw new IllegalStateException("Sample submission is required.");
        }

        if (startAt == null) {
            throw new IllegalStateException("Calibration round start time is required.");
        }

        if (endAt == null) {
            throw new IllegalStateException("Calibration round end time is required.");
        }
    }

    private void validateTimeRange() {
        if (startAt != null && endAt != null && !endAt.isAfter(startAt)) {
            throw new IllegalStateException(
                    "Calibration round end time must be after start time."
            );
        }
    }

    private void applyDefaults() {
        if (isMandatory == null) {
            isMandatory = true;
        }
    }

    // Helper methods


    // Checks whether the calibration round is currently open.
    public boolean isOpen(LocalDateTime now) {
        return now != null
                && !now.isBefore(startAt)
                && !now.isAfter(endAt);
    }


    // Checks whether the calibration round has not started yet.
    public boolean isNotStarted(LocalDateTime now) {
        return now != null && now.isBefore(startAt);
    }


    // Checks whether the calibration round is already closed.
    public boolean isClosed(LocalDateTime now) {
        return now != null && now.isAfter(endAt);
    }


    // Checks whether the distribution chart has been published.
    public boolean isDistributionPublished() {
        return distributionPublishedAt != null;
    }


    // Publishes the distribution chart.
    public void publishDistribution() {
        this.distributionPublishedAt = LocalDateTime.now();
    }


    // Checks whether benchmark scores are configured.
    public boolean hasBenchmarkScores() {
        return benchmarkScores != null && !benchmarkScores.isEmpty();
    }


    // Returns the benchmark score of a specific event criterion.
    public Float getBenchmarkScore(UUID eventCriteriaId) {
        if (benchmarkScores == null || eventCriteriaId == null) {
            return null;
        }

        return benchmarkScores.get(eventCriteriaId.toString());
    }


    // Checks whether this calibration round is mandatory.
    public boolean isMandatoryRound() {
        return Boolean.TRUE.equals(isMandatory);
    }

    public boolean appliesToRound(UUID roundId) {
        return roundId != null
                && sampleSubmission != null
                && sampleSubmission.getRound() != null
                && roundId.equals(sampleSubmission.getRound().getId());
    }
}
