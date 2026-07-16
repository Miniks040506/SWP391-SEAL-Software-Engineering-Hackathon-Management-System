package com.t7.seal.response.integration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "GitHub repository authorization flow created for the current user.")
public record GithubOAuthStartResponse(
        @Schema(description = "GitHub authorization URL to open.", format = "uri")
        String authorizationUrl,
        @Schema(description = "Expiration time of the encrypted OAuth state.", format = "date-time")
        Instant expiresAt
) {
}
