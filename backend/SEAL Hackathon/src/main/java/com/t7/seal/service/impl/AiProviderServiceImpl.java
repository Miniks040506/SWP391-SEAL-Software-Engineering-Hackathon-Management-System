package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.domain.AiLanguage;
import com.t7.seal.dto.ai.AiProviderRequest;
import com.t7.seal.dto.ai.AiProviderResult;
import com.t7.seal.service.AiProviderService;
import dev.langchain4j.model.chat.ChatModel;
import dev.langchain4j.model.openai.OpenAiChatModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.ArrayList;
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

        if (!properties.isEnabled() || apiKey == null || apiKey.isBlank()
                || provider.equals("RULE_BASED") || provider.equals("MOCK")) {
            return fallback(request, provider, model);
        }

        if (provider.equals("OPENAI") || provider.equals("DEEPSEEK")
                || provider.equals("OPENAI_COMPATIBLE")) {
            return callLangChain4jOpenAiCompatible(request, provider, apiKey, model);
        }

        return fallback(request, provider + "_NOT_IMPLEMENTED", model);
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

    private String buildFullPrompt(AiProviderRequest request) {
        return request.systemPrompt() + "\n\n" + buildUserPrompt(request);
    }

    private String buildUserPrompt(AiProviderRequest request) {
        List<String> parts = new ArrayList<>();

        if (request.translationMode()) {
            parts.add("Mode: translate or explain bilingually. " +
                    "Target language: " + request.targetLanguage());
        }

        if (request.retrievedContext() != null && !request.retrievedContext().isEmpty()) {
            parts.add("Relevant SEAL project context." +
                    " Use these snippets as the primary source. " +
                    "Cite them conceptually but do not invent private data:\n"
                    + String.join("\n---\n", request.retrievedContext()));
        }

        parts.add("User message:\n" + request.userMessage());

        return String.join("\n\n", parts);
    }

    private AiProviderResult fallback(
            AiProviderRequest request,
            String provider,
            String model
    ) {
        String answer;

        if (request.translationMode()) {
            answer = fallbackTranslate(request.userMessage(), request.targetLanguage());
        } else if (request.retrievedContext() != null && !request.retrievedContext().isEmpty()) {
            String langLead = request.language() == AiLanguage.EN
                    ? "Based on SEAL project context: "
                    : "Dựa trên context project SEAL: ";

            answer = langLead + summarizeContext(request.retrievedContext())
                    + (request.language() == AiLanguage.EN

                    ? "\n\nI can explain the workflow, checklist, and debugging direction, " +
                    "but I will not write a complete team submission solution."

                    : "\n\nMình có thể giải thích flow, checklist và hướng debug, " +
                    "nhưng không viết full solution/bài nộp cho team.");
        } else {
            answer = request.language() == AiLanguage.EN

                    ? "I can help with SEAL workflows, project-related technology, " +
                    "translation, debugging guidance, and safe checklists. " +
                    "I cannot write complete competition or assignment code for a team. " +
                    "Configure SEAL_AI_CHAT_API_KEY and " +
                    "SEAL_AI_PROVIDER=OPENAI/DEEPSEEK/OPENAI_COMPATIBLE to enable the real model."

                    : "Mình có thể hỗ trợ flow SEAL, công nghệ liên quan project, " +
                    "dịch Việt/Anh, hướng debug và checklist an toàn. " +
                    "Mình không viết full code/bài nộp cho team. " +
                    "Hãy cấu hình SEAL_AI_CHAT_API_KEY và " +
                    "SEAL_AI_PROVIDER=OPENAI/DEEPSEEK/OPENAI_COMPATIBLE để bật model thật.";
        }

        return new AiProviderResult(answer, provider, model, false);
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
