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
                @Index(name = "idx_submission_status", columnList = "status")
        })
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

    @CreationTimestamp
    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30)
    @Builder.Default
    private SubmissionStatus status = SubmissionStatus.DRAFT;

    @Column(name = "submission_number", nullable = false)
    @Builder.Default
    private Integer submissionNumber = 1;

    @OneToMany(
            mappedBy = "submission",
            cascade = CascadeType.ALL,
            orphanRemoval = true
    )
    private List<SubmissionLink> submissionLinks;

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

    //Check if the submission is still being graded by the Judge.
    public boolean isScorable() {
        return status == SubmissionStatus.SUBMITTED
                || status == SubmissionStatus.LATE;
    }

    //Mark the submission as completed on time.
    public void markSubmitted() {
        this.status = SubmissionStatus.SUBMITTED;
    }

    //Mark this as a late submission.
    public void markLate() {
        this.status = SubmissionStatus.LATE;
    }

    //Mark this entry as disqualified.
    public void disqualify() {
        this.status = SubmissionStatus.DISQUALIFIED;
    }

    //Increase the number of submissions when the Leader resubmits.
    public void increaseSubmissionNumber() {
        if (this.submissionNumber == null) {
            this.submissionNumber = 1;
        } else {
            this.submissionNumber++;
        }
    }
}
