package com.t7.seal.entities;

import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.infrastructure.RepositoryMetadata;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.annotations.UpdateTimestamp;
import org.hibernate.type.SqlTypes;
import org.hibernate.validator.constraints.URL;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "submission_links",
        indexes = {
                @Index(name = "idx_submission_link_submission", columnList = "submission_id"),
                @Index(name = "idx_submission_link_type", columnList = "link_type")
        })
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SubmissionLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "submission_id", nullable = false)
    private Submission submission;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", nullable = false, length = 30)
    private SubmissionLinkType linkType;

    @URL(message = "Submission link URL must be valid")
    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    @Column(name = "label", length = 200)
    private String label;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "repo_metadata", columnDefinition = "jsonb")
    private RepositoryMetadata repoMetadata;

    @Column(name = "is_primary", nullable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "display_order", nullable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Validation & normalization

    @PrePersist
    @PreUpdate
    private void validateAndNormalize() {
        validateOtherLabel();
        normalizeRepoMetadata();
    }

    private void validateOtherLabel() {
        if (linkType == SubmissionLinkType.OTHER) {
            if (label == null || label.isBlank()) {
                throw new IllegalStateException(
                        "Label is required when submission link type is OTHER."
                );
            }
        }
    }

    private void normalizeRepoMetadata() {
        if (linkType != SubmissionLinkType.REPOSITORY) {
            repoMetadata = null;
        }
    }

    // Helper methods

    public boolean isRepositoryLink() {
        return linkType == SubmissionLinkType.REPOSITORY;
    }

    public boolean isOtherLink() {
        return linkType == SubmissionLinkType.OTHER;
    }

    public String getDisplayLabel() {
        if (label != null && !label.isBlank()) {
            return label;
        }

        if (linkType == null) {
            return "Link";
        }

        return switch (linkType) {
            case REPOSITORY -> "Repository";
            case DEMO -> "Demo";
            case SLIDE -> "Slide";
            case REPORT -> "Report";
            case VIDEO -> "Video";
            case OTHER -> "Other";
        };
    }
}
