package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "AuditLogResponse", description = "Response payload for audit log.")
public record AuditLogResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "UUID reference to the actor.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID actorId,
        @Schema(
                description = "API-returned value for actor name.",
                example = "actor name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String actorName,
        @Schema(
                description = "API-returned value for action type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String actionType,
        @Schema(
                description = "API-returned value for target table.",
                example = "target table example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String targetTable,
        @Schema(
                description = "UUID reference to the target.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID targetId,
        @Schema(
                description = "API-returned value for before state.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object beforeState,
        @Schema(
                description = "API-returned value for after state.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object afterState,
        @Schema(
                description = "API-returned value for context.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object context,
        @Schema(
                description = "API-returned value for ip address.",
                example = "ip address example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String ipAddress,
        @Schema(
                description = "API-returned value for user agent.",
                example = "user agent example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String userAgent,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt
) {
}