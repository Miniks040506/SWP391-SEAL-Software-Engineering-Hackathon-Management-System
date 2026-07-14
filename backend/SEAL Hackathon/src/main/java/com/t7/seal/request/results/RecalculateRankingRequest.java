package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "RecalculateRankingRequest", description = "Request payload for recalculate ranking.")
public record RecalculateRankingRequest(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID roundId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid"
        )
        UUID trackId
) {}
