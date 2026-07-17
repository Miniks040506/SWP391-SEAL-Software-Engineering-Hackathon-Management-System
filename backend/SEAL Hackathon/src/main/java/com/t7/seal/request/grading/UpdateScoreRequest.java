package com.t7.seal.request.grading;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

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
        @Size(max = 2000) String comment,
        @Schema(
                description = "Last score version observed by the client.",
                example = "3"
        )
        Long expectedVersion
) {}
