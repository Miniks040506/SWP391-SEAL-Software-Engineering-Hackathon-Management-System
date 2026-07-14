package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "TeamJoinRequestResponse", description = "Response payload for team join request.")
public record TeamJoinRequestResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID teamId,
        @Schema(
                description = "API-returned value for team name.",
                example = "team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamName,
        @Schema(
                description = "UUID reference to the requester.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID requesterId,
        @Schema(
                description = "API-returned value for requester name.",
                example = "requester name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String requesterName,
        @Schema(
                description = "API-returned value for requester email.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String requesterEmail,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "COMPLETE",
                allowableValues = {"FORMING", "COMPLETE", "INCOMPLETE", "REGISTERED", "COMPETING", "ELIMINATED", "ADVANCED", "WINNER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message,
        @Schema(
                description = "API-returned value for response reason.",
                example = "response reason example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String responseReason,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt,
        @Schema(
                description = "Timestamp for expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime expiresAt,
        @Schema(
                description = "Timestamp for responded.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime respondedAt
) {
}