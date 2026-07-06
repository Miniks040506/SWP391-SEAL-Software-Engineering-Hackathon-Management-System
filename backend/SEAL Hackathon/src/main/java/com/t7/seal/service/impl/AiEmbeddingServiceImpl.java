package com.t7.seal.service.impl;

import com.t7.seal.service.AiEmbeddingService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Service
@RequiredArgsConstructor
public class AiEmbeddingServiceImpl implements AiEmbeddingService {
    @Override
    public boolean isEmbeddingEnabled() {
        return false;
    }

    @Override
    public Optional<float[]> embed(String text) {
        return Optional.empty();
    }

    @Override
    public String modelName() {
        return "";
    }

    @Override
    public int dimension() {
        return 0;
    }
}
