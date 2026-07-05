package com.t7.seal.response.assistant;

import java.time.LocalDateTime;
import java.util.UUID;

public record AssistantMessageResponse(
        UUID id,
        UUID conversationId,
        String role,
        String content,
        String language,
        String intent,
        String safetyDecision,
        String provider,
        String model,
        Boolean usedRag,
        LocalDateTime createdAt
) {}
