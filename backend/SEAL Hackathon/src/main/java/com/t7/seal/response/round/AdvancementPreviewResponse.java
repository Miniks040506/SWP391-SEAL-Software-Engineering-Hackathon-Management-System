package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.team.TeamAdvancementDecisionResponse;

import java.util.List;
import java.util.UUID;

@Schema(name = "AdvancementPreviewResponse", description = "Response payload for advancement preview.")
public record AdvancementPreviewResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for advancement confirmed.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean advancementConfirmed,
        @Schema(
                description = "Collection of suggested advanced teams.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<RankingResponse> suggestedAdvancedTeams,
        @Schema(
                description = "Collection of all rankings.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<RankingResponse> allRankings,
        @Schema(
                description = "Collection of decisions.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<TeamAdvancementDecisionResponse> decisions,
        @Schema(
                description = "Collection of warnings.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<String> warnings
) {
}