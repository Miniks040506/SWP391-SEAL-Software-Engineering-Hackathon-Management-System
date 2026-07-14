package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "JudgeAssignmentResponse", description = "Response payload for judge assignment.")
public record JudgeAssignmentResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID judgeId,
        @Schema(
                description = "API-returned value for judge name.",
                example = "judge name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeName,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for scoring progress.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int scoringProgress,
        @Schema(
                description = "API-returned value for total to score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer totalToScore
) {
}