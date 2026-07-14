package com.t7.seal.response.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "PrizeResponse", description = "Response payload for prize.")
public record PrizeResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
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
                description = "Ranking position.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer rankPosition,
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String title,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "Business value or score value.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        BigDecimal value,
        @Schema(
                description = "API-returned value for currency.",
                example = "VND",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String currency,
        @Schema(
                description = "API-returned value for sponsor name.",
                example = "sponsor name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String sponsorName,
        @Schema(
                description = "UUID reference to the awarded team.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID awardedTeamId,
        @Schema(
                description = "API-returned value for awarded team name.",
                example = "awarded team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String awardedTeamName,
        @Schema(
                description = "Timestamp for awarded.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime awardedAt
) {
}