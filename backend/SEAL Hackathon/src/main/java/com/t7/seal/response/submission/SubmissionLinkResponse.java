package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.dto.RepositoryMetadata;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "SubmissionLinkResponse", description = "Response payload for submission link.")
public record SubmissionLinkResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "API-returned value for link type.",
                example = "REPOSITORY",
                allowableValues = {"REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String linkType,
        @Schema(
                description = "Absolute resource URL.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String url,
        @Schema(
                description = "API-returned value for label.",
                example = "label example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String label,
        @Schema(
                description = "API-returned value for storage provider.",
                example = "GITHUB",
                allowableValues = {"EXTERNAL_URL", "GOOGLE_DRIVE", "AWS_S3", "GITHUB", "GITLAB"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String storageProvider,
        @Schema(
                description = "API-returned value for object key.",
                example = "object key example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String objectKey,
        @Schema(
                description = "API-returned value for original file name.",
                example = "original file name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String originalFileName,
        @Schema(
                description = "File MIME type.",
                example = "application/pdf",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String contentType,
        @Schema(
                description = "File size in bytes.",
                example = "2048",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long fileSizeBytes,
        @Schema(
                description = "API-returned value for repo metadata.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        RepositoryMetadata repoMetadata,
        @Schema(
                description = "Whether primary.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isPrimary,
        @Schema(
                description = "API-returned value for display order.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer displayOrder,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt
) {
}