package com.t7.seal.response.assistant;

import java.time.LocalDateTime;
import java.util.UUID;

public record AiSafetyLogResponse(
        UUID id,
        UUID userId,
        String userName,
        String decision,
        String riskType,
        String intent,
        int severity,
        String reason,
        String pageContext,
        LocalDateTime createdAt
) {}
