package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.dto.ai.AiProviderRequest;
import com.t7.seal.dto.ai.AiProviderResult;
import com.t7.seal.service.AiProviderService;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AiProviderServiceImpl implements AiProviderService {

    private final AiProviderProperties properties;

    @Override
    public AiProviderResult generate(AiProviderRequest request) {
        String provider = normalizeProvider(properties.getProvider());
        String apiKey = properties.getChat().getApiKey();
        String model = properties.getChat().getModel();



        return null;
    }

    //HELPERS

    private AiProviderResult callLangChain4jOpenAiCompatible(
            AiProviderRequest request,
            String provider,
            String apiKey,
            String modelName
    ) {
        try {
            ChatModel chatModel = OpenAiChatModel.builder()
                    .baseUrl(
                            normalizeBaseUrl(provider,
                            properties.getChat().getBaseUrl())
                    )
                    .apiKey(apiKey)
                    .modelName(modelName)
                    .temperature(properties.getChat().getTemperature())
                    .maxTokens(Math.max(64, properties.getChat().getMaxTokens()))
                    .timeout(Duration.ofSeconds(
                            Math.max(5, properties.getChat().getTimeoutSeconds()))
                    )
                    .build();

            String answer = chatModel.chat(buildFullPrompt(request));
            if (answer == null || answer.isBlank()) {
                return fallback(request, provider + "_EMPTY", modelName);
            }

            return new AiProviderResult(
                    answer.trim(),
                    provider + ":LANGCHAIN4J",
                    modelName,
                    true
            );
        } catch (Exception ex) {
            return fallback(
                    request,
                    provider + "_LANGCHAIN4J_FALLBACK",
                    modelName
            );
        }
    }


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
