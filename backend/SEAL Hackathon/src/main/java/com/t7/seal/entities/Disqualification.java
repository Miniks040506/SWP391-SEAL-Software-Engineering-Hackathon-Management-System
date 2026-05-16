package com.t7.seal.entities;


import com.t7.seal.domain.AppealStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "disqualification")
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

    //The coordinator signed the disqualify order.
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "issued_by", nullable = false)
    private User issuedBy;

    @Column(name = "reason", nullable = false, columnDefinition = "TEXT")
    private String reason;

    /**
     * Link evidence.
     * Ví dụ:
     * - Google Drive evidence
     * - Screenshot
     * - Report document
     */
    @URL(message = "Evidence URL must be valid")
    @Column(name = "evidence_url", length = 500)
    private String evidenceUrl;

    // Appeal note from the Team.
    @Column(name = "appeal_note", columnDefinition = "TEXT")
    private String appealNote;

    @Enumerated(EnumType.STRING)
    @Column(name = "appeal_status", length = 30)
    private AppealStatus appealStatus;

    // The moment to make the disqualify decision.
    @CreationTimestamp
    @Column(name = "issued_at", nullable = false, updatable = false)
    private LocalDateTime issuedAt;

    // Validation

    @PrePersist
    @PreUpdate
    private void validate() {
        if (reason == null || reason.isBlank()) {
            throw new IllegalStateException("Disqualification reason is required.");
        }
    }

    // Helper methods

    public boolean hasEvidence() {
        return evidenceUrl != null && !evidenceUrl.isBlank();
    }

    public boolean hasAppeal() {
        return appealStatus != null;
    }

    public boolean isAppealPending() {
        return appealStatus == AppealStatus.PENDING;
    }

    public boolean isUpheld() {
        return appealStatus == AppealStatus.UPHELD;
    }

    public boolean isOverturned() {
        return appealStatus == AppealStatus.OVERTURNED;
    }

    public void submitAppeal(String appealNote) {
        this.appealNote = appealNote;
        this.appealStatus = AppealStatus.PENDING;
    }

    public void upholdAppealDecision() {
        this.appealStatus = AppealStatus.UPHELD;
    }

    public void overturnAppealDecision() {
        this.appealStatus = AppealStatus.OVERTURNED;
    }
}
