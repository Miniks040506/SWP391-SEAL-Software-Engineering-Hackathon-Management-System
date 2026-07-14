package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "ExportDownloadResponse", description = "Response payload for export download.")
public record ExportDownloadResponse(
        @Schema(
                description = "UUID reference to the export.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID exportId,
        @Schema(
                description = "File name.",
                example = "submission.pdf",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fileName,
        @Schema(
                description = "File MIME type.",
                example = "application/pdf",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String contentType,
        @Schema(
                description = "API-returned value for download url.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String downloadUrl,
        @Schema(
                description = "Timestamp for expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime expiresAt
) {
}