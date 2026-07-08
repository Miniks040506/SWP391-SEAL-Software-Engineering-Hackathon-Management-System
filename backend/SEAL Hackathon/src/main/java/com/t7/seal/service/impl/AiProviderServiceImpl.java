package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.dto.ai.AiProviderRequest;
import com.t7.seal.dto.ai.AiProviderResult;
import com.t7.seal.service.AiProviderService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AiProviderServiceImpl implements AiProviderService {

    private final AiProviderProperties properties;

    @Override
    public AiProviderResult generate(AiProviderRequest request) {
        return null;
    }

    //HELPERS

    private String summarizeContext(List<String> contexts) {
        String joined = String.join(" ", contexts);
        return joined.length() > 900 ? joined.substring(0, 897) + "..." : joined;
    }

    private String fallbackTranslate(String message, String targetLanguage) {
            String target = targetLanguage == null
                    ? "the requested language" : targetLanguage;

            return "Translation mode is enabled, but no external AI provider is configured. " +
                    "Target language: " + target +
                    ". Configure SEAL_AI_CHAT_API_KEY to enable high-quality " +
                    "Vietnamese/English translation. Original text: " + message;
    }

    private String normalizeProvider(String provider) {
        return provider == null || provider.isBlank()
                ? "RULE_BASED" : provider.trim().toUpperCase(Locale.ROOT);
    }

    private String normalizeBaseUrl(String provider, String configuredBaseUrl) {
        String baseUrl = configuredBaseUrl == null || configuredBaseUrl.isBlank()
                ? "https://api.openai.com/v1" : configuredBaseUrl.trim();

        if (provider.equals("DEEPSEEK") && baseUrl.equals("https://api.openai.com/v1")) {
            return "https://api.deepseek.com";
        }
        
        return baseUrl;
    }
}
