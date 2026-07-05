package com.t7.seal.request.assistant;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record AssistantChatRequest(
        @NotBlank String message,
        UUID conversationId,
        UUID eventId,
        UUID teamId,
        UUID roundId,
        String pageContext,
        String preferredLanguage,
        String attachmentText,
        String attachmentFileName,
        String translationSourceLanguage,
        String translationTargetLanguage
) {}
