package com.t7.seal.response.assistant;

import java.time.LocalDateTime;
import java.util.UUID;

public record AssistantConversationResponse(
        UUID id,
        String title,
        String language,
        String lastIntent,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {}