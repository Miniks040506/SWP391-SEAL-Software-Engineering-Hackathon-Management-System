package com.t7.seal.request.criteria;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UpdateScoringCriteriaRequest", description = "Request payload for update scoring criteria.")
public record UpdateScoringCriteriaRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators"
        )
        String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description,
        @Schema(
                description = "Client-supplied value for rubric.",
                example = "rubric example"
        )
        String rubric,
        @Schema(
                description = "Maximum allowed score.",
                example = "8.5"
        )
        Double maxScore,
        @Schema(
                description = "Client-supplied value for default weight.",
                example = "8.5"
        )
        Double defaultWeight,
        @Schema(
                description = "Client-supplied value for category.",
                example = "TECHNICAL"
        )
        String category,
        @Schema(
                description = "Whether technical.",
                example = "true"
        )
        Boolean isTechnical,
        @Schema(
                description = "Whether default.",
                example = "true"
        )
        Boolean isDefault,
        @Schema(
                description = "Whether the resource is active.",
                example = "true"
        )
        Boolean isActive
) {}
