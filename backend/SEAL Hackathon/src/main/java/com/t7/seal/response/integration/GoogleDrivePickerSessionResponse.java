package com.t7.seal.response.integration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Short-lived credentials and public configuration for Google Picker.")
public record GoogleDrivePickerSessionResponse(
        @Schema(
                description = "Short-lived Drive access token. A refresh token is never returned.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String accessToken,
        @Schema(description = "Access-token expiry.", format = "date-time", accessMode = Schema.AccessMode.READ_ONLY)
        Instant expiresAt,
        @Schema(description = "Public Google Picker API key.", accessMode = Schema.AccessMode.READ_ONLY)
        String pickerApiKey,
        @Schema(description = "Google Cloud project number used by Picker.", accessMode = Schema.AccessMode.READ_ONLY)
        String appId
) {
}
