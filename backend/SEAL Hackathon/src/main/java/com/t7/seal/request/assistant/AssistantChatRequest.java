package com.t7.seal.request.assistant;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

@Schema(name = "AssistantChatRequest", description = "Request payload for assistant chat.")
public record AssistantChatRequest(
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String message,
        @Schema(
                description = "UUID reference to the conversation.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid"
        )
        UUID conversationId,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid"
        )
        UUID eventId,
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid"
        )
        UUID teamId,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid"
        )
        UUID roundId,
        @Schema(
                description = "Client-supplied value for page context.",
                example = "page context example"
        )
        String pageContext,
        @Schema(
                description = "Client-supplied value for preferred language.",
                example = "preferred language example"
        )
        String preferredLanguage,
        @Schema(
                description = "Client-supplied value for attachment text.",
                example = "attachment text example"
        )
        String attachmentText,
        @Schema(
                description = "Client-supplied value for attachment file name.",
                example = "attachment file name example"
        )
        String attachmentFileName,
        @Schema(
                description = "Client-supplied value for translation source language.",
                example = "translation source language example"
        )
        String translationSourceLanguage,
        @Schema(
                description = "Client-supplied value for translation target language.",
                example = "translation target language example"
        )
        String translationTargetLanguage
) {}