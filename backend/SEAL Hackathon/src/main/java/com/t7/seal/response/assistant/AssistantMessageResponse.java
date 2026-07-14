package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "AssistantMessageResponse", description = "Response payload for assistant message.")
public record AssistantMessageResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "UUID reference to the conversation.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID conversationId,
        @Schema(
                description = "User, member, or message role.",
                example = "USER",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String role,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String content,
        @Schema(
                description = "API-returned value for language.",
                example = "VI",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String language,
        @Schema(
                description = "API-returned value for intent.",
                example = "intent example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String intent,
        @Schema(
                description = "API-returned value for safety decision.",
                example = "ALLOW",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String safetyDecision,
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
                description = "API-returned value for used rag.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean usedRag,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt
) {
}