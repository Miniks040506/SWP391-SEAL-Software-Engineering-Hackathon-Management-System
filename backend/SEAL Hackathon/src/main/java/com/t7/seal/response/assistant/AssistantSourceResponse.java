package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "AssistantSourceResponse", description = "Response payload for assistant source.")
public record AssistantSourceResponse(
        @Schema(
                description = "UUID reference to the document.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID documentId,
        @Schema(
                description = "UUID reference to the chunk.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID chunkId,
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String title,
        @Schema(
                description = "API-returned value for doc type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String docType,
        @Schema(
                description = "API-returned value for module.",
                example = "module example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String module,
        @Schema(
                description = "UUID reference to the use case.",
                example = "use case id example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String useCaseId,
        @Schema(
                description = "API-returned value for excerpt.",
                example = "excerpt example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String excerpt,
        @Schema(
                description = "Score value.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        double score
) {
}