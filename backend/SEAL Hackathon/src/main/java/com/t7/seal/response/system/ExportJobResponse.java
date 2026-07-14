package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "ExportJobResponse", description = "Response payload for export job.")
public record ExportJobResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "API-returned value for requested by.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID requestedBy,
        @Schema(
                description = "API-returned value for export type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String exportType,
        @Schema(
                description = "API-returned value for params.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object params,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "QUEUED",
                allowableValues = {"QUEUED", "PROCESSING", "DONE", "FAILED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "File name.",
                example = "submission.pdf",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fileName,
        @Schema(
                description = "File size in bytes.",
                example = "2048",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long fileSizeBytes,
        @Schema(
                description = "Number of row.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer rowCount,
        @Schema(
                description = "API-returned value for error message.",
                example = "error message example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String errorMessage,
        @Schema(
                description = "Timestamp for requested.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime requestedAt,
        @Schema(
                description = "Timestamp for completed.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime completedAt,
        @Schema(
                description = "Timestamp for expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime expiresAt
) {
}