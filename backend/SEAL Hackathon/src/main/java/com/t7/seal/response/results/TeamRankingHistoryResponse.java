package com.t7.seal.response.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "TeamRankingHistoryResponse", description = "Response payload for team ranking history.")
public record TeamRankingHistoryResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for round name.",
                example = "round name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundName,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for track name.",
                example = "track name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackName,
        @Schema(
                description = "Weighted total score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double totalScore,
        @Schema(
                description = "Ranking position.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer rankPosition,
        @Schema(
                description = "API-returned value for advanced.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean advanced
) {
}