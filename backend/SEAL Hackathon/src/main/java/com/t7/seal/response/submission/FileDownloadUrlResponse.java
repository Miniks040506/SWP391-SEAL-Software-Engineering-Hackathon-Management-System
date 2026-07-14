package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(name = "FileDownloadUrlResponse", description = "Response payload for file download url.")
public record FileDownloadUrlResponse(
        @Schema(
                description = "Absolute resource URL.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String url,
        @Schema(
                description = "Timestamp for expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime expiresAt
) {
}