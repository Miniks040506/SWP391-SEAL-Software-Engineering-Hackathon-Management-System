package com.t7.seal.response.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record GuestJudgeResponse(
        UUID userId,
        UUID judgeId,
        String email,
        String fullName,
        String judgeType,
        Boolean guest,
        Boolean temporary,
        String affiliation,
        String expertise,
        String temporaryPasswordLink,
        LocalDateTime expiresAt
) {}
