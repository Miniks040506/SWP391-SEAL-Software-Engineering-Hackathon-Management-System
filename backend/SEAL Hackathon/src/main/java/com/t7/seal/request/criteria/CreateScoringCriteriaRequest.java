package com.t7.seal.request.criteria;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

@Schema(name = "CreateScoringCriteriaRequest", description = "Request payload for create scoring criteria.")
public record CreateScoringCriteriaRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 200) String name,
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
                example = "8.5",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Double maxScore,
        @Schema(
                description = "Client-supplied value for default weight.",
                example = "8.5",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Double defaultWeight,
        @Schema(
                description = "Client-supplied value for category.",
                example = "TECHNICAL",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String category,
        @Schema(
                description = "Whether technical.",
                example = "true"
        )
        Boolean isTechnical,
        @Schema(
                description = "Whether default.",
                example = "true"
        )
        Boolean isDefault
) {}
