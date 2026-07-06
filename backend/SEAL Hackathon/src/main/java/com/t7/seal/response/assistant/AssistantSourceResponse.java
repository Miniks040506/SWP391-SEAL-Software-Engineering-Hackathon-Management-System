package com.t7.seal.response.assistant;

import java.util.UUID;

public record AssistantSourceResponse(
        UUID documentId,
        UUID chunkId,
        String title,
        String docType,
        String module,
        String useCaseId,
        String excerpt,
        double score
) {}
