package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "TeamInvitationResponse", description = "Response payload for team invitation.")
public record TeamInvitationResponse(
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
                description = "API-returned value for invited email.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String invitedEmail,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "COMPLETE",
                allowableValues = {"FORMING", "COMPLETE", "INCOMPLETE", "REGISTERED", "COMPETING", "ELIMINATED", "ADVANCED", "WINNER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Timestamp for expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime expiresAt,
        @Schema(
                description = "One-time or refresh token, depending on the operation.",
                example = "sample-one-time-token",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String token,
        @Schema(
                description = "API-returned value for accept url.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String acceptUrl,
        @Schema(
                description = "API-returned value for reject url.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String rejectUrl
) {
}