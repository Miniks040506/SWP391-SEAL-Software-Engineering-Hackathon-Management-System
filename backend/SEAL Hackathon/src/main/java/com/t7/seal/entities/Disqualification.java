package com.t7.seal.entities;


import com.t7.seal.domain.AppealStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "disqualifications",
        uniqueConstraints = {
                @UniqueConstraint(
                        name = "uk_disqualification_submission",
                        columnNames = "submission_id"
                )
        },
        indexes = {
                @Index(name = "idx_disqualification_submission", columnList = "submission_id"),
                @Index(name = "idx_disqualification_issued_by", columnList = "issued_by"),
                @Index(name = "idx_disqualification_appeal_status", columnList = "appeal_status"),
                @Index(name = "idx_disqualification_issued_at", columnList = "issued_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Disqualification {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false, unique = true)
    private Submission submission;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by", nullable = false)
    private User issuedBy;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    /**
     * Optional evidence URL.
     * Examples:
     * - Google Drive evidence folder
     * - screenshot link
     * - plagiarism report
     * - violation report document
     */
    @URL(message = "Evidence URL must be valid")
    @Column(name = "evidence_url", length = 500)
    private String evidenceUrl;

    /**
     * Appeal note submitted by the team.
     * This can contain the team's explanation, clarification,
     * or request to review the disqualification decision.
     */
    @Column(name = "appeal_note", columnDefinition = "TEXT")
    private String appealNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "appeal_status", length = 30)
    private AppealStatus appealStatus;

    @CreationTimestamp
    @Column(name = "issued_at", nullable = false, updatable = false)
    private LocalDateTime issuedAt;

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
    }

    private void validateRequiredFields() {
        if (submission == null) {
            throw new IllegalStateException("Submission is required.");
        }

        if (issuedBy == null) {
            throw new IllegalStateException("Issued by user is required.");
        }

        if (reason == null || reason.isBlank()) {
            throw new IllegalStateException("Disqualification reason is required.");
        }
    }

    // Helper methods


    // Checks whether evidence URL is provided.
    public boolean hasEvidence() {
        return evidenceUrl != null && !evidenceUrl.isBlank();
    }


    // Checks whether the team has submitted an appeal.
    public boolean hasAppeal() {
        return appealStatus != null;
    }


    // Checks whether the appeal is currently pending.
    public boolean isAppealPending() {
        return appealStatus == AppealStatus.PENDING;
    }


    // Checks whether the disqualification decision was upheld.
    public boolean isAppealUpheld() {
        return appealStatus == AppealStatus.UPHELD;
    }


    // Checks whether the disqualification decision was overturned.
    public boolean isAppealOverturned() {
        return appealStatus == AppealStatus.OVERTURNED;
    }


    // Submits an appeal from the team.
    public void submitAppeal(String appealNote) {
        if (appealNote == null || appealNote.isBlank()) {
            throw new IllegalArgumentException("Appeal note is required.");
        }

        this.appealNote = appealNote;
        this.appealStatus = AppealStatus.PENDING;
    }


    // Keeps the original disqualification decision.
    public void upholdAppeal() {
        this.appealStatus = AppealStatus.UPHELD;
    }

    /**
     * Cancels the disqualification decision.
     * The service layer should also restore Submission status
     * and recalculate Ranking in the same transaction.
     */
    public void overturnAppeal() {
        this.appealStatus = AppealStatus.OVERTURNED;
    }
}
