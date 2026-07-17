package com.t7.seal.request.grading;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(name = "ScoreItemRequest", description = "Request payload for score item.")
public record ScoreItemRequest(
        @Schema(
                description = "Event criteria UUID.",
                example = "0cfa724d-9d3b-5576-af11-77ae9e87b4d1",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID eventCriteriaId,
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
                description = "Last score version observed by the client. Omit for a new score.",
                example = "3"
        )
        Long expectedVersion
) {}
