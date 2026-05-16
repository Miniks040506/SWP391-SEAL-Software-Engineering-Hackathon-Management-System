package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "round_judge_assignments",
        indexes = {
                @Index(name = "idx_rja_round", columnList = "round_id"),
                @Index(name = "idx_rja_judge", columnList = "judge_id"),
                @Index(name = "idx_rja_track", columnList = "track_id"),
                @Index(name = "idx_rja_assigned_by", columnList = "assigned_by")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RoundJudgeAssignment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "judge_id", nullable = false)
    private Judge judge;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @Column(name = "scoring_progress", nullable = false)
    @Builder.Default
    private Integer scoringProgress = 0;

    @Column(name = "total_to_score")
    private Integer totalToScore;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "assigned_by", nullable = false)
    private User assignedBy;

    @CreationTimestamp
    @Column(name = "assigned_at", nullable = false, updatable = false)
    private LocalDateTime assignedAt;

    @Column(name = "reminded_at")
    private LocalDateTime remindedAt;

    // Effective value helper methods

    public boolean isAssignedToAllTracks() {
        return track == null;
    }

    public boolean hasTotalToScore() {
        return totalToScore != null && totalToScore > 0;
    }

    public double getProgressPercentage() {
        if (totalToScore == null || totalToScore == 0) {
            return 0.0;
        }

        return scoringProgress * 100.0 / totalToScore;
    }

    public String getProgressDisplay() {
        if (totalToScore == null) {
            return scoringProgress + "/?";
        }

        return scoringProgress + "/" + totalToScore
                + " (" + String.format("%.0f", getProgressPercentage()) + "%)";
    }

    public boolean isCompleted() {
        return totalToScore != null
                && totalToScore > 0
                && scoringProgress >= totalToScore;
    }

    //Check if the Judge is authorized to grade a Submission belonging to this round/track.
    // + Must be in the same Round.
    // + If assignment.track == null, then all Tracks in the Round can be graded.
    // + If assignment.track != null, then the Submission must belong to that specific Track.
    public boolean canScore(UUID submissionRoundId, UUID submissionTrackId) {
        if (round == null || round.getId() == null) {
            return false;
        }

        if (!round.getId().equals(submissionRoundId)) {
            return false;
        }

        if (track == null) {
            return true;
        }

        return track.getId() != null && track.getId().equals(submissionTrackId);
    }
}
