package com.t7.seal.response.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "RefreshTokenResponse", description = "Response payload for refresh token.")
public record RefreshTokenResponse(
        @Schema(
                description = "Short-lived JWT access token.",
                example = "sample-jwt-access-token",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String accessToken,
        @Schema(
                description = "Token used to obtain a new access token.",
                example = "sample-refresh-token",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String refreshToken,
        @Schema(
                description = "API-returned value for access token expires in ms.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long accessTokenExpiresInMs,
        @Schema(
                description = "API-returned value for refresh token expires in ms.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long refreshTokenExpiresInMs
) {
}