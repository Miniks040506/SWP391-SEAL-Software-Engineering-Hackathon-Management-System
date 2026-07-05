package com.t7.seal.request.assistant;

import jakarta.validation.constraints.NotBlank;

public record CreateKnowledgeDocumentRequest(
        @NotBlank String title,
        @NotBlank String content,
        String docType,
        String sourceRef,
        String visibility,
        String module,
        String useCaseId,
        String roleScope
) {}

