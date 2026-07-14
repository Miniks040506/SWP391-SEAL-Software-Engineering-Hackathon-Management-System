package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "RoundLockResponse", description = "Response payload for round lock.")
public record RoundLockResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for lock type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String lockType,
        @Schema(
                description = "Timestamp for locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime lockedAt,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message
) {
}