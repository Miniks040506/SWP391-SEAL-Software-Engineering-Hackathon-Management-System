package com.t7.seal.entities;

import com.t7.seal.domain.RoundStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "round")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Round {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "event_id", nullable = false)
    private UUID eventId;

    @Column(length = 200, nullable = false)
    private String name;

    @Column(name = "order_index", nullable = false)
    private Integer orderIndex;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "submission_deadline", nullable = false)
    private LocalDateTime submissionDeadline;

    @Column(name = "judging_deadline")
    private LocalDateTime judgingDeadline;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private RoundStatus status = RoundStatus.UPCOMING;

    @Column(name = "is_final", nullable = false)
    @Builder.Default
    private Boolean isFinal = false;

    @Column(name = "submission_locked_at")
    private LocalDateTime submissionLockedAt;

    @Column(name = "advancement_confirmed_at")
    private LocalDateTime advancementConfirmedAt;

    // Checks whether submissions are open and not locked.
    public boolean isSubmissionOpen() {
        return status == RoundStatus.OPEN && submissionLockedAt == null;
    }

    // Checks whether submissions have been locked.
    public boolean isSubmissionLocked() {
        return submissionLockedAt != null;
    }

    // Checks whether advancement has been confirmed.
    public boolean isAdvancementConfirmed() {
        return advancementConfirmedAt != null;
    }

    // Checks whether this round is marked as the final round.
    public boolean isFinalRound() {
        return Boolean.TRUE.equals(isFinal);
    }

    // Locks submissions for this round.
    public void lockSubmissions(LocalDateTime now) {
        if (submissionLockedAt != null) {
            throw new IllegalStateException("Submissions are already locked.");
        }

        submissionLockedAt = now;
    }

    // Confirms advancement after submissions have been locked.
    public void confirmAdvancement(LocalDateTime now) {
        if (submissionLockedAt == null || advancementConfirmedAt != null) {
            throw new IllegalStateException("Advancement requires locked submissions and no prior confirmation.");
        }

        advancementConfirmedAt = now;
    }
}
