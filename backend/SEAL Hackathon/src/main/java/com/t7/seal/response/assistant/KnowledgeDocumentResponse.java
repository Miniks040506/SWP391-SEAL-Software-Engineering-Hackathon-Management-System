package com.t7.seal.response.assistant;

import java.time.LocalDateTime;
import java.util.UUID;

public record KnowledgeDocumentResponse(
        UUID id,
        String title,
        String docType,
        String sourceRef,
        String visibility,
        String module,
        boolean active,
        int chunkCount,
        LocalDateTime updatedAt
) {}
