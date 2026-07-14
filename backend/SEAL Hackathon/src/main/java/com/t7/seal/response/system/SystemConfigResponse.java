package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "SystemConfigResponse", description = "Response payload for system config.")
public record SystemConfigResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "API-returned value for config key.",
                example = "config key example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String configKey,
        @Schema(
                description = "API-returned value for config value.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object configValue,
        @Schema(
                description = "API-returned value for category.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String category,
        @Schema(
                description = "API-returned value for value type.",
                example = "STRING",
                allowableValues = {"STRING", "INTEGER", "BOOLEAN", "JSON"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String valueType,
        @Schema(
                description = "API-returned value for encrypted.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean encrypted,
        @Schema(
                description = "Whether the resource is active.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean active,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt
) {
}