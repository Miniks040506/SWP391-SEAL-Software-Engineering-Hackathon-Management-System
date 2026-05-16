package com.t7.seal.entities;

import com.t7.seal.domain.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;
import org.yaml.snakeyaml.error.Mark;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(
        name = "submissions",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_submission_team_round",
                        columnNames = {"team_id", "round_id"}
                )
        },
        indexes = {
                @Index(name = "idx_submission_team", columnList = "team_id"),
                @Index(name = "idx_submission_round", columnList = "round_id"),
                @Index(name = "idx_submission_status", columnList = "status"),
                @Index(name = "idx_submission_submitted_at", columnList = "submitted_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Submission {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "round_id", nullable = false)
    private Round round;

    @Column(name = "note", columnDefinition = "TEXT")
    private String note;

    /**
     * The official submission time.
     * For draft submissions, this can be treated as the draft creation time.
     * When the leader submits or resubmits, the service may update this value.
     */
    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.DRAFT;

    /**
     * Counts how many times the team has submitted or resubmitted.
     * First submission starts at 1.
     * Each resubmission increases this value by 1.
     */
    @Column(name = "submission_number", nullable = false)
    @Builder.Default
    private Integer submissionNumber = 1;

    /**
     * Links attached to this submission.
     * Examples:
     * - repository link
     * - demo link
     * - slide link
     * - report link
     * - video link
     */
    @OneToMany(
            mappedBy = "submission",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SubmissionLink> submissionLinks;

    /**
     * Scores given by judges for this submission.
     */
    @OneToMany(
            mappedBy = "submission",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Score> scores;

    @OneToMany(
            mappedBy = "submission",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<Ranking> rankings;

    /**
     * Disqualification record of this submission, if any.
     * Each submission can have at most one disqualification record.
     */
    @OneToOne(
            mappedBy = "submission",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private Disqualification disqualification;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        if (team == null) {
            throw new IllegalStateException("Submission team is required.");
        }

        if (round == null) {
            throw new IllegalStateException("Submission round is required.");
        }

        if (status == null) {
            status = SubmissionStatus.DRAFT;
        }

        if (submissionNumber == null || submissionNumber < 1) {
            submissionNumber = 1;
        }
    }

    // Helper methods

    public boolean isDraft() {
        return status == SubmissionStatus.DRAFT;
    }

    public boolean isSubmitted() {
        return status == SubmissionStatus.SUBMITTED;
    }

    public boolean isLate() {
        return status == SubmissionStatus.LATE;
    }

    public boolean isDisqualified() {
        return status == SubmissionStatus.DISQUALIFIED;
    }

    /**
     * Checks whether this submission can be scored by judges.
     */
    public boolean isScorable() {
        return status == SubmissionStatus.SUBMITTED
                || status == SubmissionStatus.LATE;
    }

    /**
     * Marks this submission as officially submitted on time.
     */
    public void markSubmitted() {
        this.status = SubmissionStatus.SUBMITTED;
        this.submittedAt = LocalDateTime.now();
    }

    /**
     * Marks this as a late submission.
     */
    public void markLate() {
        this.status = SubmissionStatus.LATE;
        this.submittedAt = LocalDateTime.now();
    }

    /**
     * Marks this submission as disqualified.
     */
    public void markDisqualified() {
        this.status = SubmissionStatus.DISQUALIFIED;
    }

    /**
     * Increases the submission count when the team leader resubmits.
     */
    public void increaseSubmissionNumber() {
        if (this.submissionNumber == null) {
            this.submissionNumber = 1;
        } else {
            this.submissionNumber++;
        }
    }

    /**
     * Handles resubmission by updating the note, submission count, and status.
     */
    public void resubmit(String newNote, boolean late) {
        this.note = newNote;
        increaseSubmissionNumber();

        if (late) {
            markLate();
        } else {
            markSubmitted();
        }
    }

    public boolean hasDisqualification() {
        return disqualification != null;
    }

    public boolean hasLinks() {
        return submissionLinks != null && !submissionLinks.isEmpty();
    }

    public boolean hasScores() {
        return scores != null && !scores.isEmpty();
    }
}