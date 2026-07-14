package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "JudgeVarianceResponse", description = "Response payload for judge variance.")
public record JudgeVarianceResponse(
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID judgeId,
        @Schema(
                description = "UUID reference to the hashed judge.",
                example = "sha256-example-hash",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String hashedJudgeId,
        @Schema(
                description = "API-returned value for judge type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeType,
        @Schema(
                description = "API-returned value for mean score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double meanScore,
        @Schema(
                description = "API-returned value for variance.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double variance,
        @Schema(
                description = "API-returned value for standard deviation.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double standardDeviation,
        @Schema(
                description = "API-returned value for min score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double minScore,
        @Schema(
                description = "Maximum allowed score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double maxScore,
        @Schema(
                description = "Number of score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer scoreCount,
        @Schema(
                description = "API-returned value for high variance.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean highVariance
) {
}