package com.t7.seal.response.integration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Google Drive authorization flow created for the current user.")
public record GoogleDriveOAuthStartResponse(
        @Schema(
                description = "Google authorization URL to open in the browser.",
                format = "uri",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String authorizationUrl,
        @Schema(
                description = "Expiration time of the encrypted OAuth state.",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Instant expiresAt
) {
}
