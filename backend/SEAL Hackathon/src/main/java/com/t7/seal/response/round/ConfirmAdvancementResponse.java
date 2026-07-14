package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.response.team.TeamAdvancementDecisionResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "ConfirmAdvancementResponse", description = "Response payload for confirm advancement.")
public record ConfirmAdvancementResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Number of advanced.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int advancedCount,
        @Schema(
                description = "Number of eliminated.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int eliminatedCount,
        @Schema(
                description = "Timestamp for confirmed.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime confirmedAt,
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