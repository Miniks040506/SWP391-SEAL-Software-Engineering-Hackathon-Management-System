package com.t7.seal.response.assistant;

import java.time.LocalDateTime;

public record AiReindexResponse(
        int indexedChunks,
        String embeddingModel,
        int dimension,
        LocalDateTime indexedAt
) {}
