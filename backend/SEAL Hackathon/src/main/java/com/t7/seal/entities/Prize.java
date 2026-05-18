package com.t7.seal.entities;


import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "prizes",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_prize_event_track_rank",
                        columnNames = {"event_id", "track_id", "rank_position"}
                )
        },
        indexes = {
                @Index(name = "idx_prize_event", columnList = "event_id"),
                @Index(name = "idx_prize_track", columnList = "track_id"),
                @Index(name = "idx_prize_awarded_team", columnList = "awarded_team_id"),
                @Index(name = "idx_prize_rank_position", columnList = "rank_position")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Prize {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "event_id", nullable = false)
    private HackathonEvent event;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "track_id")
    private Track track;

    @Column(name = "rank_position", nullable = false)
    private Integer rankPosition;


    // Prize title displayed on UI and certificates.
    @Column(name = "title", nullable = false, length = 200)
    private String title;

    @Column(name = "description", columnDefinition = "TEXT")
    private String description;

    @Column(name = "value", precision = 12, scale = 2)
    private BigDecimal value;

    @Column(name = "currency", length = 10)
    private String currency;

    @Column(name = "sponsor_name", length = 200)
    private String sponsorName;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "awarded_team_id")
    private Team awardedTeam;

    @Column(name = "awarded_at")
    private LocalDateTime awardedAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validatePrizeValue();
        validateAwardState();
    }

    private void validateRequiredFields() {
        if (event == null) {
            throw new IllegalStateException("Event is required.");
        }

        if (rankPosition == null || rankPosition < 1) {
            throw new IllegalStateException("Rank position must be greater than or equal to 1.");
        }

        if (title == null || title.isBlank()) {
            throw new IllegalStateException("Prize title is required.");
        }
    }

    private void validatePrizeValue() {
        if (value != null && value.compareTo(BigDecimal.ZERO) < 0) {
            throw new IllegalStateException("Prize value must be greater than or equal to 0.");
        }

        if (value != null && (currency == null || currency.isBlank())) {
            throw new IllegalStateException("Currency is required when prize value is provided.");
        }
    }

    private void validateAwardState() {
        if (awardedAt != null && awardedTeam == null) {
            throw new IllegalStateException("Awarded team is required when awardedAt is set.");
        }
    }

    // Helper methods


    // Checks whether this is an overall event-level prize.
    public boolean isOverallPrize() {
        return track == null;
    }


    // Checks whether this prize belongs to a specific track.
    public boolean isTrackPrize() {
        return track != null;
    }

    // Checks whether this prize has been awarded.
    public boolean isAwarded() {
        return awardedTeam != null;
    }


    // Checks whether this prize has monetary value.
    public boolean hasMonetaryValue() {
        return value != null;
    }

    // Checks whether this prize has sponsor information.
    public boolean hasSponsor() {
        return sponsorName != null && !sponsorName.isBlank();
    }

    /**
     * Awards this prize to a team.
     * This should be called after rankings are finalized
     * and the coordinator confirms the result.
     */
    public void awardTo(Team team) {
        if (team == null) {
            throw new IllegalArgumentException("Awarded team is required.");
        }

        this.awardedTeam = team;
        this.awardedAt = LocalDateTime.now();
    }

    /**
     * Clears the awarded team.
     * This may be used when rankings are recalculated
     * or an award decision is reverted.
     */
    public void clearAward() {
        this.awardedTeam = null;
        this.awardedAt = null;
    }
}
