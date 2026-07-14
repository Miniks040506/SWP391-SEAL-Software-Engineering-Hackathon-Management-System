package com.t7.seal.response.criteria;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "ScoringCriteriaResponse", description = "Response payload for scoring criteria.")
public record ScoringCriteriaResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "API-returned value for rubric.",
                example = "rubric example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String rubric,
        @Schema(
                description = "Maximum allowed score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double maxScore,
        @Schema(
                description = "API-returned value for default weight.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double defaultWeight,
        @Schema(
                description = "API-returned value for category.",
                example = "TECHNICAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String category,
        @Schema(
                description = "Whether technical.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isTechnical,
        @Schema(
                description = "Whether default.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isDefault,
        @Schema(
                description = "Whether the resource is active.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isActive
) {
}