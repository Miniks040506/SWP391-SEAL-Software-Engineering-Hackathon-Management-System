package com.t7.seal.response.round;

import java.time.LocalDateTime;
import java.util.UUID;

public record RoundLockResponse(
        UUID roundId,
        String lockType,
        LocalDateTime lockedAt,
        String message
) {}
