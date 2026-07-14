package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;

@Schema(name = "AiReindexResponse", description = "Response payload for ai reindex.")
public record AiReindexResponse(
        @Schema(
                description = "API-returned value for indexed chunks.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int indexedChunks,
        @Schema(
                description = "API-returned value for embedding model.",
                example = "embedding model example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String embeddingModel,
        @Schema(
                description = "API-returned value for dimension.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int dimension,
        @Schema(
                description = "Timestamp for indexed.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime indexedAt
) {
}
