package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.service.AiEmbeddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

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
        return Optional.empty();
    }

    @Override
    public String modelName() {
        return properties.getEmbedding().getModel();
    }

    @Override
    public int dimension() {
        return Math.max(1, properties.getEmbedding().getDimension());
    }
}
