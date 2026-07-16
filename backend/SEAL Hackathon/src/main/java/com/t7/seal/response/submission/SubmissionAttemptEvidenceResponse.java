package com.t7.seal.response.submission;

import com.t7.seal.dto.RepositoryMetadata;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(
        name = "SubmissionAttemptEvidenceResponse",
        description = "Immutable evidence captured when a submission attempt was finalized."
)
public record SubmissionAttemptEvidenceResponse(
        @Schema(
                description = "Immutable attempt-evidence identifier.",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Original mutable submission-link identifier, when still available.",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID sourceLinkId,
        @Schema(
                description = "Submission requirement type satisfied by this evidence.",
                allowableValues = {"REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String linkType,
        @Schema(
                description = "External or provider URL. Null for private uploads, which require the authorized download endpoint.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String url,
        @Schema(description = "User-facing evidence label.", accessMode = Schema.AccessMode.READ_ONLY)
        String label,
        @Schema(
                description = "Provider from which the evidence was captured.",
                allowableValues = {"EXTERNAL_URL", "GOOGLE_DRIVE", "AWS_S3", "GITHUB", "GITLAB"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String storageProvider,
        @Schema(description = "Original uploaded or imported file name.", accessMode = Schema.AccessMode.READ_ONLY)
        String originalFileName,
        @Schema(description = "Captured file MIME type.", accessMode = Schema.AccessMode.READ_ONLY)
        String contentType,
        @Schema(description = "Captured file size in bytes.", accessMode = Schema.AccessMode.READ_ONLY)
        Long fileSizeBytes,
        @Schema(description = "Repository metadata frozen with the attempt.", accessMode = Schema.AccessMode.READ_ONLY)
        RepositoryMetadata repoMetadata,
        @Schema(description = "Whether this was the primary evidence of its type.", accessMode = Schema.AccessMode.READ_ONLY)
        Boolean isPrimary,
        @Schema(description = "Captured evidence display order.", accessMode = Schema.AccessMode.READ_ONLY)
        Integer displayOrder,
        @Schema(
                description = "Timestamp when the immutable evidence record was created.",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt
) {
}
