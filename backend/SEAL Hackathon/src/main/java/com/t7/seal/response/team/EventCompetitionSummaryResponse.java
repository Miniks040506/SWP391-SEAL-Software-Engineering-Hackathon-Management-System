package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "EventCompetitionSummaryResponse", description = "Response payload for event competition summary.")
public record EventCompetitionSummaryResponse(
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "API-returned value for event name.",
                example = "event name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventName,
        @Schema(
                description = "API-returned value for event status.",
                example = "REGISTRATION",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventStatus,
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
                description = "API-returned value for team status.",
                example = "REGISTRATION",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamStatus,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for track name.",
                example = "track name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackName
) {
}