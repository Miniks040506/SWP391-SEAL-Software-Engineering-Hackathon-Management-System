package com.t7.seal.response.integration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Current user's Google Drive integration status without provider credentials.")
public record GoogleDriveConnectionStatusResponse(
        @Schema(description = "Whether Drive is configured and enabled.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean available,
        @Schema(description = "Actionable provider availability explanation.", accessMode = Schema.AccessMode.READ_ONLY)
        String availabilityMessage,
        @Schema(description = "Whether the user has an active Drive connection.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean connected,
        @Schema(description = "Connected Google account e-mail, when available.", accessMode = Schema.AccessMode.READ_ONLY)
        String accountEmail,
        @Schema(description = "Most recent successful connection time.", format = "date-time", accessMode = Schema.AccessMode.READ_ONLY)
        Instant connectedAt,
        @Schema(description = "Current access-token expiry; the token itself is never returned.", format = "date-time", accessMode = Schema.AccessMode.READ_ONLY)
        Instant tokenExpiresAt
) {
}
