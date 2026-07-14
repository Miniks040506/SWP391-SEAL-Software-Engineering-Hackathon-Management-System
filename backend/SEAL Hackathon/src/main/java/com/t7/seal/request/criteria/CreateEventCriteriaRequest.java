package com.t7.seal.request.criteria;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "CreateEventCriteriaRequest", description = "Request payload for create event criteria.")
public record CreateEventCriteriaRequest(
        @Schema(
                description = "Scoring criteria UUID.",
                example = "0cfa724d-9d3b-5576-af11-77ae9e87b4d1",
                format = "uuid"
        )
        UUID criteriaId,
        @Schema(
                description = "Client-supplied value for name override.",
                example = "name override example"
        )
        String nameOverride,
        @Schema(
                description = "Client-supplied value for description override.",
                example = "description override example"
        )
        String descriptionOverride,
        @Schema(
                description = "Client-supplied value for rubric override.",
                example = "rubric override example"
        )
        String rubricOverride,
        @Schema(
                description = "Client-supplied value for weight override.",
                example = "8.5"
        )
        Double weightOverride,
        @Schema(
                description = "Client-supplied value for max score override.",
                example = "8.5"
        )
        Double maxScoreOverride,
        @Schema(
                description = "Whether technical override.",
                example = "true"
        )
        Boolean isTechnicalOverride,
        @Schema(
                description = "Collection of applies to round ids."
        )
        List<UUID> appliesToRoundIds,
        @Schema(
                description = "Client-supplied value for display order.",
                example = "1"
        )
        Integer displayOrder
) {}
