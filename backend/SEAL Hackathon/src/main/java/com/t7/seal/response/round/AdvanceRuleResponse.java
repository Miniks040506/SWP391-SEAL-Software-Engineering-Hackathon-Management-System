package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "AdvanceRuleResponse", description = "Response payload for advance rule.")
public record AdvanceRuleResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for rule type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String ruleType,
        @Schema(
                description = "API-returned value for top n.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer topN,
        @Schema(
                description = "API-returned value for min score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double minScore,
        @Schema(
                description = "API-returned value for top percent.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double topPercent,
        @Schema(
                description = "API-returned value for wild card slots.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer wildCardSlots,
        @Schema(
                description = "Whether the resource is active.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean active,
        @Schema(
                description = "Business value or score value.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Float value,
        @Schema(
                description = "API-returned value for priority.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer priority,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description
) {
}