package com.t7.seal.entities;

import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.domain.SubmissionStorageProvider;
import com.t7.seal.dto.RepositoryMetadata;
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
                @Index(name = "idx_submission_link_type", columnList = "link_type"),
                @Index(name = "idx_submission_link_primary", columnList = "is_primary"),
                @Index(name = "idx_submission_link_display_order", columnList = "display_order")
        }
)
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

    /**
     * Full URL of the submitted resource.
     * The URL format should be validated when creating or updating this entity.
     */
    @URL(message = "Submission link URL must be valid")
    @Column(name = "url", nullable = false, length = 1000)
    private String url;

    /**
     * Custom display label.
     * This field is required when linkType is OTHER.
     */
    @Column(name = "label", length = 200)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_provider", nullable = false, length = 30)
    @Builder.Default
    private SubmissionStorageProvider storageProvider = SubmissionStorageProvider.EXTERNAL_URL;

    @Column(name = "object_key", length = 1000)
    private String objectKey;

    @Column(name = "original_file_name", length = 300)
    private String originalFileName;

    @Column(name = "content_type", length = 150)
    private String contentType;

    @Column(name = "file_size_bytes")
    private Long fileSizeBytes;

    @Column(name = "provider_resource_id", length = 255)
    private String providerResourceId;

    @Column(name = "provider_checksum", length = 128)
    private String providerChecksum;

    @Column(name = "provider_modified_at")
    private LocalDateTime providerModifiedAt;

    /**
     * Repository metadata extracted from Git APIs.
     * This field should only be used when linkType is repository.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "repo_metadata", columnDefinition = "jsonb")
    private RepositoryMetadata repoMetadata;


    // Marks this link as the main link within the same link type.
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

    // Lifecycle validation

    @PrePersist
    @PreUpdate
    private void validate() {
        validateRequiredFields();
        validateOtherLabel();
        normalizeRepositoryMetadata();
    }

    private void validateRequiredFields() {
        if (submission == null) {
            throw new IllegalStateException("Submission is required.");
        }

        if (linkType == null) {
            throw new IllegalStateException("Submission link type is required.");
        }

        if (url == null || url.isBlank()) {
            throw new IllegalStateException("Submission link URL is required.");
        }

        if (isPrimary == null) {
            isPrimary = false;
        }

        if (displayOrder == null) {
            displayOrder = 0;
        }

        if (storageProvider == null) {
            storageProvider = SubmissionStorageProvider.EXTERNAL_URL;
        }
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

    private void normalizeRepositoryMetadata() {
        if (linkType != SubmissionLinkType.REPOSITORY) {
            repoMetadata = null;
        }
    }

    // Helper methods

    public boolean isRepositoryLink() {
        return linkType == SubmissionLinkType.REPOSITORY;
    }

    public boolean isDemoLink() {
        return linkType == SubmissionLinkType.DEMO;
    }

    public boolean isSlideLink() {
        return linkType == SubmissionLinkType.SLIDE;
    }

    public boolean isReportLink() {
        return linkType == SubmissionLinkType.REPORT;
    }

    public boolean isVideoLink() {
        return linkType == SubmissionLinkType.VIDEO;
    }

    public boolean isOtherLink() {
        return linkType == SubmissionLinkType.OTHER;
    }

    public boolean hasRepositoryMetadata() {
        return repoMetadata != null;
    }

    public boolean isPrimaryLink() {
        return Boolean.TRUE.equals(isPrimary);
    }

    public boolean isUploadedFile() {
        return storageProvider == SubmissionStorageProvider.AWS_S3;
    }

    public boolean isGoogleDriveLink() {
        return storageProvider == SubmissionStorageProvider.GOOGLE_DRIVE;
    }

    public boolean isExternalUrl() {
        return storageProvider == SubmissionStorageProvider.EXTERNAL_URL;
    }

    /**
     * Returns the display label of this link.
     * If a custom label exists, it will be used.
     * Otherwise, the label is generated from linkType.
     */
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
