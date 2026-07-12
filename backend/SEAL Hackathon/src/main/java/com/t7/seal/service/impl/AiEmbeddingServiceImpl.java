package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.service.AiEmbeddingService;
import dev.langchain4j.model.embedding.EmbeddingModel;
import dev.langchain4j.model.openai.OpenAiEmbeddingModel;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Duration;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiEmbeddingServiceImpl implements AiEmbeddingService {

    private final AiProviderProperties properties;

    @Override
    public boolean isEmbeddingEnabled() {
        String apiKey = properties.getEmbedding().getApiKey();
        return properties.isEnabled()
                && properties.getEmbedding().isEnabled()
                && apiKey != null
                && !apiKey.isBlank();
    }

    @Override
    public Optional<float[]> embed(String text) {
        if (!isEmbeddingEnabled() || text == null || text.isBlank()) {
            return Optional.empty();
        }
        try {
            EmbeddingModel model = OpenAiEmbeddingModel.builder()
                    .baseUrl(normalizeBaseUrl(properties.getEmbedding().getBaseUrl()))
                    .apiKey(properties.getEmbedding().getApiKey())
                    .modelName(properties.getEmbedding().getModel())
                    .timeout(Duration.ofSeconds(
                            Math.max(5, properties.getEmbedding().getTimeoutSeconds())
                    ))
                    .build();
            return Optional.of(model.embed(text).content().vector());
        } catch (Exception ex) {
            return Optional.empty();
        }
    }

    @Override
    public String modelName() {
        return properties.getEmbedding().getModel();
    }

    @Override
    public int dimension() {
        return Math.max(1, properties.getEmbedding().getDimension());
    }

    private String normalizeBaseUrl(String value) {
        String base = value == null || value.isBlank()
                ? "https://api.openai.com/v1"
                : value.trim();

        if ("DEEPSEEK".equals(properties.getProvider().toUpperCase(Locale.ROOT))
                && base.equals("https://api.openai.com/v1")) {
            return "https://api.deepseek.com";
        }

        return base;
    }
}
