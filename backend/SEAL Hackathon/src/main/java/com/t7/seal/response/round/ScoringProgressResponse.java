package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "ScoringProgressResponse", description = "Response payload for scoring progress.")
public record ScoringProgressResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for completed.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int completed,
        @Schema(
                description = "API-returned value for total.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int total,
        @Schema(
                description = "API-returned value for percent.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        double percent,
        @Schema(
                description = "Collection of judges.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<JudgeProgressResponse> judges
) {
}
