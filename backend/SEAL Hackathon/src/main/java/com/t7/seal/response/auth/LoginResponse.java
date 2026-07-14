package com.t7.seal.response.auth;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "LoginResponse", description = "Response payload for login.")
public record LoginResponse(
        @Schema(
                description = "User UUID.",
                example = "18000000-0000-4000-8000-000000000001",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID userId,
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String email,
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fullName,
        @Schema(
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String role,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "User avatar URL.",
                example = "https://example.test/avatar.png",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String avatarUrl,
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
