package com.t7.seal.entities;

import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.domain.SubmissionStorageProvider;
import com.t7.seal.dto.RepositoryMetadata;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.Immutable;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Immutable
@Table(
        name = "submission_attempt_links",
        indexes = {
                @Index(name = "idx_submission_attempt_link_attempt", columnList = "attempt_id"),
                @Index(name = "idx_submission_attempt_link_type", columnList = "link_type"),
                @Index(name = "idx_submission_attempt_link_source", columnList = "source_link_id")
        }
)
@Getter
@Builder
@NoArgsConstructor(access = AccessLevel.PROTECTED)
@AllArgsConstructor
public class SubmissionAttemptLink {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "attempt_id", nullable = false, updatable = false)
    private SubmissionAttempt attempt;

    @Column(name = "source_link_id", updatable = false)
    private UUID sourceLinkId;

    @Enumerated(EnumType.STRING)
    @Column(name = "link_type", nullable = false, length = 30, updatable = false)
    private SubmissionLinkType linkType;

    @Column(name = "url", nullable = false, length = 1000, updatable = false)
    private String url;

    @Column(name = "label", length = 200, updatable = false)
    private String label;

    @Enumerated(EnumType.STRING)
    @Column(name = "storage_provider", nullable = false, length = 30, updatable = false)
    private SubmissionStorageProvider storageProvider;

    @Column(name = "object_key", length = 1000, updatable = false)
    private String objectKey;

    @Column(name = "original_file_name", length = 300, updatable = false)
    private String originalFileName;

    @Column(name = "content_type", length = 150, updatable = false)
    private String contentType;

    @Column(name = "file_size_bytes", updatable = false)
    private Long fileSizeBytes;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "repo_metadata", columnDefinition = "jsonb", updatable = false)
    private RepositoryMetadata repoMetadata;

    @Column(name = "is_primary", nullable = false, updatable = false)
    @Builder.Default
    private Boolean isPrimary = false;

    @Column(name = "display_order", nullable = false, updatable = false)
    @Builder.Default
    private Integer displayOrder = 0;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
