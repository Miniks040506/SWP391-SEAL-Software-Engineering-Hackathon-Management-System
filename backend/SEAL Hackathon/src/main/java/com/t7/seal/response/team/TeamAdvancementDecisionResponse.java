package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "TeamAdvancementDecisionResponse", description = "Response payload for team advancement decision.")
public record TeamAdvancementDecisionResponse(
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID teamId,
        @Schema(
                description = "API-returned value for team name.",
                example = "team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamName,
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
                description = "Ranking position.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer rankPosition,
        @Schema(
                description = "Weighted total score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double totalScore,
        @Schema(
                description = "API-returned value for suggested advanced.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean suggestedAdvanced,
        @Schema(
                description = "API-returned value for final advanced.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean finalAdvanced,
        @Schema(
                description = "API-returned value for team status.",
                example = "COMPLETE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamStatus,
        @Schema(
                description = "API-returned value for advance reason.",
                example = "advance reason example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String advanceReason,
        @Schema(
                description = "API-returned value for override reason.",
                example = "override reason example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String overrideReason
) {
}