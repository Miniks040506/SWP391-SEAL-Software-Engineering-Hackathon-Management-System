package com.t7.seal.response.calibration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "CriterionDistributionResponse", description = "Response payload for criterion distribution.")
public record CriterionDistributionResponse(
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
                description = "API-returned value for benchmark score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double benchmarkScore,
        @Schema(
                description = "Number of judge.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long judgeCount,
        @Schema(
                description = "API-returned value for mean.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double mean,
        @Schema(
                description = "API-returned value for min.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double min,
        @Schema(
                description = "API-returned value for max.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double max,
        @Schema(
                description = "API-returned value for standard deviation.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double standardDeviation
) {
}