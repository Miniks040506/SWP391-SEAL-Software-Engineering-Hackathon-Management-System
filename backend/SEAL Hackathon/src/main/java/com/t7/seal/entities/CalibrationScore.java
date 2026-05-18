package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "calibration_scores",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_calibration_score_round_judge_criteria",
                        columnNames = {
                                "calibration_round_id",
                                "judge_id",
                                "event_criteria_id"
                        }
                )
        },
        indexes = {
                @Index(name = "idx_calibration_score_round", columnList = "calibration_round_id"),
                @Index(name = "idx_calibration_score_judge", columnList = "judge_id"),
                @Index(name = "idx_calibration_score_event_criteria", columnList = "event_criteria_id"),
                @Index(name = "idx_calibration_score_scored_at", columnList = "scored_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CalibrationScore {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calibration_round_id", nullable = false)
    private CalibrationRound calibrationRound;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private Judge judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_criteria_id", nullable = false)
    private EventCriteria eventCriteria;

    @Column(name = "value", nullable = false)
    private Float value;

    /**
     * Difference between the judge's score and the benchmark score.
     * Formula:
     * deviation_from_benchmark = value - benchmark_scores[event_criteria_id]
     * Positive value means the judge scored higher than the benchmark.
     * Negative value means the judge scored lower than the benchmark.
     */
    @Column(name = "deviation_from_benchmark")
    private Float deviationFromBenchmark;

    @CreationTimestamp
    @Column(name = "scored_at", nullable = false, updatable = false)
    private LocalDateTime scoredAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validateAndCalculateDeviation() {
        validateRequiredFields();
        validateScoreValue();
        calculateDeviationFromBenchmark();
    }

    private void validateRequiredFields() {
        if (calibrationRound == null) {
            throw new IllegalStateException("Calibration round is required.");
        }

        if (judge == null) {
            throw new IllegalStateException("Judge is required.");
        }

        if (eventCriteria == null) {
            throw new IllegalStateException("Event criteria is required.");
        }

        if (value == null) {
            throw new IllegalStateException("Calibration score value is required.");
        }
    }

    private void validateScoreValue() {
        if (value < 0) {
            throw new IllegalStateException(
                    "Calibration score value must be greater than or equal to 0."
            );
        }

        Float maxScore = eventCriteria.getEffectiveMaxScore();

        if (maxScore != null && value > maxScore) {
            throw new IllegalStateException(
                    "Calibration score value must not exceed effective max score: " + maxScore
            );
        }
    }

    private void calculateDeviationFromBenchmark() {
        if (calibrationRound == null || eventCriteria == null || eventCriteria.getId() == null) {
            return;
        }

        Float benchmarkScore = calibrationRound.getBenchmarkScore(eventCriteria.getId());

        if (benchmarkScore == null) {
            this.deviationFromBenchmark = null;
            return;
        }

        this.deviationFromBenchmark = this.value - benchmarkScore;
    }

    // Helper methods


    // Checks whether this score has benchmark deviation data.
    public boolean hasDeviationFromBenchmark() {
        return deviationFromBenchmark != null;
    }


    // Checks whether the judge scored higher than the benchmark.
    public boolean isAboveBenchmark() {
        return deviationFromBenchmark != null && deviationFromBenchmark > 0;
    }

    // Checks whether the judge scored lower than the benchmark.
    public boolean isBelowBenchmark() {
        return deviationFromBenchmark != null && deviationFromBenchmark < 0;
    }

    // Checks whether the judge matched the benchmark score exactly.
    public boolean matchesBenchmark() {
        return deviationFromBenchmark != null
                && Float.compare(deviationFromBenchmark, 0.0f) == 0;
    }


    // Returns the absolute deviation from benchmark.
    public Float getAbsoluteDeviation() {
        if (deviationFromBenchmark == null) {
            return null;
        }

        return Math.abs(deviationFromBenchmark);
    }
}