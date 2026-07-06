package com.t7.seal.dto.ai;

import com.t7.seal.domain.AiLanguage;

import java.util.List;

public record AiProviderRequest(
        String systemPrompt,
        String userMessage,
        AiLanguage language,
        List<String> retrievedContext,
        boolean translationMode,
        String targetLanguage
) {}
