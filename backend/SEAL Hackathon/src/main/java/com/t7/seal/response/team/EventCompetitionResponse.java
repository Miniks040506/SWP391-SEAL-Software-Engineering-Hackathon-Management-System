package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "EventCompetitionResponse", description = "Response payload for event competition.")
public record EventCompetitionResponse(
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
                description = "API-returned value for leader.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean leader,
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
        String trackName,
        @Schema(
                description = "API-returned value for track description.",
                example = "track description example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackDescription,
        @Schema(
                description = "Collection of rounds.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<EventCompetitionRoundResponse> rounds,
        @Schema(
                description = "API-returned value for server time.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime serverTime
) {
}