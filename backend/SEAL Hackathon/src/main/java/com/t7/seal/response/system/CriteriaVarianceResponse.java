package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "CriteriaVarianceResponse", description = "Response payload for criteria variance.")
public record CriteriaVarianceResponse(
        @Schema(
                description = "Event criteria UUID.",
                example = "0cfa724d-9d3b-5576-af11-77ae9e87b4d1",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventCriteriaId,
        @Schema(
                description = "API-returned value for criteria name.",
                example = "criteria name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String criteriaName,
        @Schema(
                description = "API-returned value for category.",
                example = "TECHNICAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String category,
        @Schema(
                description = "API-returned value for technical.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean technical,
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
                description = "Number of judge.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer judgeCount,
        @Schema(
                description = "API-returned value for high variance.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean highVariance
) {
}