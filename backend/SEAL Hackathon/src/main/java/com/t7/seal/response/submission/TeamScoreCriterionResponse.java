package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "TeamScoreCriterionResponse", description = "Response payload for team score criterion.")
public record TeamScoreCriterionResponse(
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
                description = "API-returned value for average score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double averageScore,
        @Schema(
                description = "Maximum allowed score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double maxScore,
        @Schema(
                description = "Weight used in score calculation.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double weight,
        @Schema(
                description = "Number of judge.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer judgeCount
) {
}