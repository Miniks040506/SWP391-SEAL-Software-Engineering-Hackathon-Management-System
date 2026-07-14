package com.t7.seal.request.criteria;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "UpdateEventCriteriaRequest", description = "Request payload for update event criteria.")
public record UpdateEventCriteriaRequest(
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
                description = "Whether the resource is active.",
                example = "true"
        )
        Boolean isActive,
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
