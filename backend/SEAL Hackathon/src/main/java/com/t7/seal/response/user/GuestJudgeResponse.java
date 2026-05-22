package com.t7.seal.response.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record GuestJudgeResponse(
        UUID userId, UUID judgeId,
        String email, String temporaryPasswordLink,
        LocalDateTime expiresAt
) {}
