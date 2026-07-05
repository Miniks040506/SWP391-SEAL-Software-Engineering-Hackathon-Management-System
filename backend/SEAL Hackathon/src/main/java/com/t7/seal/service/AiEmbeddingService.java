package com.t7.seal.service;

import java.util.Optional;

public interface AiEmbeddingService {

    boolean isEmbeddingEnabled();

    Optional<float[]> embed(String text);

    String modelName();

    int dimension();
}
