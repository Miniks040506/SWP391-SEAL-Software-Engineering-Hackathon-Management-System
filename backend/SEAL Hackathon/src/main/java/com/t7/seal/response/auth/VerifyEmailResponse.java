package com.t7.seal.response.auth;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "VerifyEmailResponse", description = "Response payload for verify email.")
public record VerifyEmailResponse(
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
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message
) {
}