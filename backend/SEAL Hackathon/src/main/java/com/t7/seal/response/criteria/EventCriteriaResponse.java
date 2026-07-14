package com.t7.seal.response.criteria;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "EventCriteriaResponse", description = "Response payload for event criteria.")
public record EventCriteriaResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "Scoring criteria UUID.",
                example = "0cfa724d-9d3b-5576-af11-77ae9e87b4d1",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID criteriaId,
        @Schema(
                description = "API-returned value for template name.",
                example = "template name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String templateName,
        @Schema(
                description = "API-returned value for template category.",
                example = "template category example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String templateCategory,
        @Schema(
                description = "Whether custom.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isCustom,
        @Schema(
                description = "API-returned value for name override.",
                example = "name override example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String nameOverride,
        @Schema(
                description = "API-returned value for description override.",
                example = "description override example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String descriptionOverride,
        @Schema(
                description = "API-returned value for rubric override.",
                example = "rubric override example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String rubricOverride,
        @Schema(
                description = "API-returned value for weight override.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double weightOverride,
        @Schema(
                description = "API-returned value for max score override.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double maxScoreOverride,
        @Schema(
                description = "Whether technical override.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isTechnicalOverride,
        @Schema(
                description = "API-returned value for effective name.",
                example = "effective name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String effectiveName,
        @Schema(
                description = "API-returned value for effective description.",
                example = "effective description example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String effectiveDescription,
        @Schema(
                description = "API-returned value for effective rubric.",
                example = "effective rubric example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String effectiveRubric,
        @Schema(
                description = "API-returned value for effective weight.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double effectiveWeight,
        @Schema(
                description = "API-returned value for effective max score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double effectiveMaxScore,
        @Schema(
                description = "API-returned value for effective is technical.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean effectiveIsTechnical,
        @Schema(
                description = "Collection of applies to round ids.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<UUID> appliesToRoundIds,
        @Schema(
                description = "API-returned value for display order.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer displayOrder,
        @Schema(
                description = "Whether the resource is active.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isActive
) {
}