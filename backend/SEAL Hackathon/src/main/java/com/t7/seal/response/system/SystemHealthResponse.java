package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.Map;

@Schema(name = "SystemHealthResponse", description = "Response payload for system health.")
public record SystemHealthResponse(
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for database up.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean databaseUp,
        @Schema(
                description = "API-returned value for mail up.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean mailUp,
        @Schema(
                description = "API-returned value for storage up.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean storageUp,
        @Schema(
                description = "API-returned value for details.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Map<String, Object> details
) {
}