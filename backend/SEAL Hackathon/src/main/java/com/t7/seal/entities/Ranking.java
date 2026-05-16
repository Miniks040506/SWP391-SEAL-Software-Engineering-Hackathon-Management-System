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
                @Index(name = "idx_ranking_round", columnList = "round_id"),
                @Index(name = "idx_ranking_track", columnList = "track_id"),
                @Index(name = "idx_ranking_round_track_rank",
                        columnList = "round_id, track_id, rank_position"),
                @Index(name = "idx_ranking_is_advanced", columnList = "is_advanced")
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
     * Total score has been aggregated.
     * Business formula:
     * AVG_judges[SUM(score.value * weight) / SUM(weight)]
     */
    @Column(name = "total_score", nullable = false)
    private Float totalScore;

    /**
     * Snapshot breakdown of scores.
     * Suggested JSONB structure:
     * {
         * "judgeId-1": {
         * "criteriaId-1": 8.5,
         * "criteriaId-2": 9.0
         * },
         * "judgeId-2": {
         * "criteriaId-1": 7.5,
         * "criteriaId-2": 8.0
         * }
     * }
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "score_breakdown", columnDefinition = "jsonb")
    private Map<String, Map<String, Float>> scoreBreakdown;

    @Column(name = "judge_count", nullable = false)
    private Integer judgeCount;

    //Ranking in the Track at Round.
    @Column(name = "rank_position", nullable = false)
    private Integer rankPosition;

    /**
     * TRUE nếu đội được advance sang Round tiếp theo.
     */
    @Column(name = "is_advanced", nullable = false)
    @Builder.Default
    private Boolean isAdvanced = false;

    @Enumerated(EnumType.STRING)
    @Column(name = "advance_reason", length = 200)
    private AdvanceReason advanceReason;

    //The most recent ranking calculation date.
    @Column(name = "calculated_at", nullable = false)
    private LocalDateTime calculatedAt;

     // Coordinator trigger calculates ranking
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "calculated_by", nullable = false)
    private User calculatedBy;

    // Helper methods

    public boolean hasAdvanced() {
        return Boolean.TRUE.equals(isAdvanced);
    }

    public boolean hasScoreBreakdown() {
        return scoreBreakdown != null && !scoreBreakdown.isEmpty();
    }

    public boolean hasEnoughJudges(int requiredJudgeCount) {
        return judgeCount != null && judgeCount >= requiredJudgeCount;
    }

    public void markAdvanced(AdvanceReason reason) {
        this.isAdvanced = true;
        this.advanceReason = reason;
    }

    public void markNotAdvanced(AdvanceReason reason) {
        this.isAdvanced = false;
        this.advanceReason = reason;
    }

    public void updateCalculationInfo(User calculatedBy) {
        this.calculatedBy = calculatedBy;
        this.calculatedAt = LocalDateTime.now();
    }
}
