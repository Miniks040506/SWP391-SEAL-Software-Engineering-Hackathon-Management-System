package com.t7.seal.response.assistant;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AssistantChatResponse(
        UUID conversationId,
        String answer,
        String intent,
        String language,
        boolean blocked,
        String guardrailReason,
        String safetyDecision,
        String riskType,
        int riskSeverity,
        boolean ragEnabled,
        boolean usedRag,
        String provider,
        String model,
        List<String> suggestedActions,
        List<AssistantSourceResponse> sources,
        Map<String, Object> roleContext,
        LocalDateTime answeredAt
) {}
