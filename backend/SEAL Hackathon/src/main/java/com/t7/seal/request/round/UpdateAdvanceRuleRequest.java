package com.t7.seal.request.round;


import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "UpdateAdvanceRuleRequest", description = "Request payload for update advance rule.")
public record UpdateAdvanceRuleRequest(
        @Schema(
                description = "Client-supplied value for rule type.",
                example = "GENERAL"
        )
        String ruleType,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid"
        )
        UUID trackId,
        @Schema(
                description = "Client-supplied value for global.",
                example = "true"
        )
        Boolean global,
        @Schema(
                description = "Client-supplied value for top n.",
                example = "10"
        )
        Integer topN,
        @Schema(
                description = "Client-supplied value for min score.",
                example = "8.5"
        )
        Double minScore,
        @Schema(
                description = "Client-supplied value for top percent.",
                example = "1"
        )
        Double topPercent,
        @Schema(
                description = "Client-supplied value for wild card slots.",
                example = "10"
        )
        Integer wildCardSlots,
        @Schema(
                description = "Client-supplied value for priority.",
                example = "10"
        )
        Integer priority,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description,
        @Schema(
                description = "Whether the resource is active.",
                example = "true"
        )
        Boolean active
) {}
