package com.t7.seal.exception;

import java.time.LocalDateTime;

public class AccountLockedException extends RuntimeException {
    private final LocalDateTime lockedUntil;
    private final long remainingSeconds;
    private final int maxFailedAttempts;

    public AccountLockedException(
            String message,
            LocalDateTime lockedUntil,
            long remainingSeconds,
            int maxFailedAttempts
    ) {
        super(message);
        this.lockedUntil = lockedUntil;
        this.remainingSeconds = remainingSeconds;
        this.maxFailedAttempts = maxFailedAttempts;
    }

    public LocalDateTime getLockedUntil() {
        return lockedUntil;
    }

    public long getRemainingSeconds() {
        return remainingSeconds;
    }

    public int getMaxFailedAttempts() {
        return maxFailedAttempts;
    }
}
