package com.t7.seal.request.grading;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "UpdateScoreRequest", description = "Request payload for update score.")
public record UpdateScoreRequest(
        @Schema(
                description = "Business value or score value.",
                example = "8.5",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Double value,
        @Schema(
                description = "Reviewer comment.",
                example = "Detailed reviewer comment."
        )
        String comment
) {}
