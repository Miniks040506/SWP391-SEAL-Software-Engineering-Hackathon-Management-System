package com.t7.seal.response.team;

import java.time.LocalDateTime;
import java.util.UUID;

public record TeamJoinRequestResponse(
        UUID id,
        UUID teamId,
        String teamName,
        UUID requesterId,
        String requesterName,
        String requesterEmail,
        String status,
        String message,
        String responseReason,
        LocalDateTime createdAt,
        LocalDateTime expiresAt,
        LocalDateTime respondedAt
) {}
