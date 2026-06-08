package com.t7.seal.response.auth;

import java.time.Instant;
import java.time.LocalDateTime;

public record LoginLockoutResponse(
        boolean success,
        int status,
        String error,
        String message,
        String path,
        Instant timestamp,
        LocalDateTime lockedUntil,
        long remainingSeconds,
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
