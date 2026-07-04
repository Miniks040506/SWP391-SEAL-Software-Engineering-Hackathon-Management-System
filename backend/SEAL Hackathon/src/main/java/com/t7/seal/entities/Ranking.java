package com.t7.seal.entities;

import com.t7.seal.domain.AdvanceReason;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
        name = "rankings",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_ranking_submission_round",
                        columnNames = {"submission_id", "round_id"}
                )
        },
        indexes = {
                @Index(name = "idx_ranking_submission", columnList = "submission_id"),
                @Index(name = "idx_ranking_round", columnList = "round_id"),
                @Index(name = "idx_ranking_track", columnList = "track_id"),
                @Index(name = "idx_ranking_round_track_rank", columnList = "round_id, track_id, rank_position"),
                @Index(name = "idx_ranking_is_advanced", columnList = "is_advanced"),
                @Index(name = "idx_ranking_calculated_by", columnList = "calculated_by")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ranking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id", nullable = false)
    private Track track;

    /**
     * Final aggregated score of the submission.
     * Business formula: AVG_judges[SUM(score.value * weight) / SUM(weight)]
     * This value is materialized to avoid recalculating scores
     * every time the leaderboard is displayed.
     */
    @Column(name = "total_score", nullable = false)
    private Double totalScore;


    // Snapshot of detailed scores.
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "score_breakdown", columnDefinition = "jsonb")
    private Map<String, Map<String, Float>> scoreBreakdown;

    @Column(name = "judge_count", nullable = false)
    private Integer judgeCount;

    /**
     * Rank position within the same round and track.
     * This value should be recalculated after:
     * - score updates
     * - disqualification
     * - manual result adjustment
     */
    @Column(name = "rank_position", nullable = false)
    private Integer rankPosition;

    @Column(name = "tied", nullable = false)
    @Builder.Default
    private Boolean tied = false;

    @Column(name = "tie_group_key", length = 160)
    private String tieGroupKey;

    @Column(name = "tie_group_size", nullable = false)
    @Builder.Default
    private Integer tieGroupSize = 1;

    @Column(name = "manual_resolution_required", nullable = false)
    @Builder.Default
    private Boolean manualResolutionRequired = false;

    /**
     * Whether the team is advanced to the next round.
     * This field is used by the advancement confirmation flow.
     */
    @Column(name = "is_advanced", nullable = false)
    @Builder.Default
    private Boolean isAdvanced = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "advance_reason", length = 200)
    private AdvanceReason advanceReason;

    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculated_by", nullable = false)
    private User calculatedBy;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validateRankingValues();
    }

    private void validateRequiredFields() {
        if (submission == null) {
            throw new IllegalStateException("Submission is required.");
        }

        if (round == null) {
            throw new IllegalStateException("Round is required.");
        }

        if (track == null) {
            throw new IllegalStateException("Track is required.");
        }

        if (calculatedBy == null) {
            throw new IllegalStateException("Calculated by user is required.");
        }

        if (calculatedAt == null) {
            calculatedAt = LocalDateTime.now();
        }

        if (isAdvanced == null) {
            isAdvanced = false;
        }

        if (tied == null) {
            tied = false;
        }

        if (tieGroupSize == null) {
            tieGroupSize = 1;
        }

        if (manualResolutionRequired == null) {
            manualResolutionRequired = false;
        }
    }

    private void validateRankingValues() {
        if (totalScore == null) {
            throw new IllegalStateException("Total score is required.");
        }

        if (totalScore < 0) {
            throw new IllegalStateException("Total score must be greater than or equal to 0.");
        }

        if (judgeCount == null || judgeCount < 0) {
            throw new IllegalStateException("Judge count must be greater than or equal to 0.");
        }

        if (rankPosition == null || rankPosition < 1) {
            throw new IllegalStateException("Rank position must be greater than or equal to 1.");
        }

        if (tieGroupSize == null || tieGroupSize < 1) {
            throw new IllegalStateException("Tie group size must be greater than or equal to 1.");
        }
    }

    // Helper methods


    // Checks whether this team has advanced to the next round.
    public boolean hasAdvanced() {
        return Boolean.TRUE.equals(isAdvanced);
    }

    // Checks whether this ranking has score breakdown data.
    public boolean hasScoreBreakdown() {
        return scoreBreakdown != null && !scoreBreakdown.isEmpty();
    }

    // Checks whether enough judges have submitted confirmed scores.
    public boolean hasEnoughJudges(int requiredJudgeCount) {
        return judgeCount != null && judgeCount >= requiredJudgeCount;
    }


    // Marks this ranking as advanced.
    public void markAdvanced(AdvanceReason reason) {
        this.isAdvanced = true;
        this.advanceReason = reason;
    }


    // Marks this ranking as not advanced.
    public void markNotAdvanced(AdvanceReason reason) {
        this.isAdvanced = false;
        this.advanceReason = reason;
    }


    // Marks this ranking as disqualified.
    public void markDisqualified() {
        this.isAdvanced = false;
        this.advanceReason = AdvanceReason.DISQUALIFIED;
    }

    // Marks this ranking as requiring manual tie resolution.
    public void markTie(String tieGroupKey, int tieGroupSize) {
        this.tied = true;
        this.tieGroupKey = tieGroupKey;
        this.tieGroupSize = tieGroupSize;
        this.manualResolutionRequired = true;
    }

    // Clears tie-resolution metadata after recalculation.
    public void clearTieStatus() {
        this.tied = false;
        this.tieGroupKey = null;
        this.tieGroupSize = 1;
        this.manualResolutionRequired = false;
    }


    // Updates calculation metadata after recalculating ranking.
    public void updateCalculationInfo(User calculatedBy) {
        this.calculatedBy = calculatedBy;
        this.calculatedAt = LocalDateTime.now();
    }

    /**
     * Returns the score of a specific judge for a specific criterion
     * from the score breakdown snapshot.
     */
    public Float getBreakdownScore(UUID judgeId, UUID criteriaId) {
        if (scoreBreakdown == null || judgeId == null || criteriaId == null) {
            return null;
        }

        Map<String, Float> judgeScores = scoreBreakdown.get(judgeId.toString());

        if (judgeScores == null) {
            return null;
        }

        return judgeScores.get(criteriaId.toString());
    }
}
