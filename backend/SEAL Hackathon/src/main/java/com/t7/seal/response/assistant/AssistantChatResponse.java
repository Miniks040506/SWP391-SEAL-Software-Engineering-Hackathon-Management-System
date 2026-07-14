package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Schema(name = "AssistantChatResponse", description = "Response payload for assistant chat.")
public record AssistantChatResponse(
        @Schema(
                description = "UUID reference to the conversation.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID conversationId,
        @Schema(
                description = "API-returned value for answer.",
                example = "answer example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String answer,
        @Schema(
                description = "API-returned value for intent.",
                example = "intent example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String intent,
        @Schema(
                description = "API-returned value for language.",
                example = "VI",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String language,
        @Schema(
                description = "API-returned value for blocked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean blocked,
        @Schema(
                description = "API-returned value for guardrail reason.",
                example = "guardrail reason example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String guardrailReason,
        @Schema(
                description = "API-returned value for safety decision.",
                example = "ALLOW",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String safetyDecision,
        @Schema(
                description = "API-returned value for risk type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String riskType,
        @Schema(
                description = "API-returned value for risk severity.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int riskSeverity,
        @Schema(
                description = "API-returned value for rag enabled.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean ragEnabled,
        @Schema(
                description = "API-returned value for used rag.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean usedRag,
        @Schema(
                description = "API-returned value for provider.",
                example = "provider example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String provider,
        @Schema(
                description = "API-returned value for model.",
                example = "model example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String model,
        @Schema(
                description = "Collection of suggested actions.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<String> suggestedActions,
        @Schema(
                description = "Collection of sources.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<AssistantSourceResponse> sources,
        @Schema(
                description = "API-returned value for role context.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Map<String, Object> roleContext,
        @Schema(
                description = "Timestamp for answered.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime answeredAt
) {
}