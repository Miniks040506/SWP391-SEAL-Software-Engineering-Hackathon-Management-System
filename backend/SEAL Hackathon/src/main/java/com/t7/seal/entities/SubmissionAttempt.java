package com.t7.seal.entities;

import com.t7.seal.domain.SubmissionStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Immutable
@Table(
        name = "submission_attempts",
        uniqueConstraints = @UniqueConstraint(
                name = "uk_submission_attempt_number",
                columnNames = {"submission_id", "attempt_number"}
        ),
        indexes = {
                @Index(name = "idx_submission_attempt_submission", columnList = "submission_id"),
                @Index(name = "idx_submission_attempt_submitted_at", columnList = "submitted_at")
        }
)
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class SubmissionAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "submission_id", nullable = false, updatable = false)
    private Submission submission;

    @Column(name = "attempt_number", nullable = false, updatable = false)
    private Integer attemptNumber;

    @Column(name = "note", columnDefinition = "TEXT", updatable = false)
    private String note;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false, length = 30, updatable = false)
    private SubmissionStatus status;

    @Column(name = "submitted_at", nullable = false, updatable = false)
    private LocalDateTime submittedAt;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @OneToMany(mappedBy = "attempt", fetch = FetchType.LAZY)
    @OrderBy("displayOrder ASC, createdAt ASC")
    @Builder.Default
    private List<SubmissionAttemptLink> links = new ArrayList<>();
}
