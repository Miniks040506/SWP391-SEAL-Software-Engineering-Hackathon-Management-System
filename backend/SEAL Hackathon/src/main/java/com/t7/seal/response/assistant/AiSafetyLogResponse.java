package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "AiSafetyLogResponse", description = "Response payload for ai safety log.")
public record AiSafetyLogResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "User UUID.",
                example = "18000000-0000-4000-8000-000000000001",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID userId,
        @Schema(
                description = "API-returned value for user name.",
                example = "user name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String userName,
        @Schema(
                description = "API-returned value for decision.",
                example = "ALLOW",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String decision,
        @Schema(
                description = "API-returned value for risk type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String riskType,
        @Schema(
                description = "API-returned value for intent.",
                example = "intent example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String intent,
        @Schema(
                description = "API-returned value for severity.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int severity,
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String reason,
        @Schema(
                description = "API-returned value for page context.",
                example = "page context example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String pageContext,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt
) {
}