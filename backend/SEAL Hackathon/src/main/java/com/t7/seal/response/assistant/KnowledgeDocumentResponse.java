package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "KnowledgeDocumentResponse", description = "Response payload for knowledge document.")
public record KnowledgeDocumentResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
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
                description = "API-returned value for source ref.",
                example = "source ref example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String sourceRef,
        @Schema(
                description = "API-returned value for visibility.",
                example = "STAFF_ONLY",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String visibility,
        @Schema(
                description = "API-returned value for module.",
                example = "module example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String module,
        @Schema(
                description = "Whether the resource is active.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean active,
        @Schema(
                description = "Number of chunk.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int chunkCount,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt
) {
}