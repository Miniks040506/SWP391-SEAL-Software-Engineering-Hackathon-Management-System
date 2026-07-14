package com.t7.seal.response.auth;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.time.LocalDateTime;

@Schema(name = "LoginLockoutResponse", description = "Response payload for login lockout.")
public record LoginLockoutResponse(
        @Schema(
                description = "Whether the request completed successfully.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean success,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int status,
        @Schema(
                description = "HTTP error reason phrase.",
                example = "Bad Request",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String error,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message,
        @Schema(
                description = "Request path that produced the response.",
                example = "/api/v1/events",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String path,
        @Schema(
                description = "Timestamp when the response was produced.",
                example = "2027-08-25T01:00:00Z",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Instant timestamp,
        @Schema(
                description = "API-returned value for locked until.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime lockedUntil,
        @Schema(
                description = "API-returned value for remaining seconds.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long remainingSeconds,
        @Schema(
                description = "API-returned value for max failed attempts.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int maxFailedAttempts
) {
    public static LoginLockoutResponse of(
            String message,
            String path,
            LocalDateTime lockedUntil,
            long remainingSeconds,
            int maxFailedAttempts
    ) {
        return new LoginLockoutResponse(
                false,
                423,
                "Locked",
                message,
                path,
                Instant.now(),
                lockedUntil,
                remainingSeconds,
                maxFailedAttempts
        );
    }
}