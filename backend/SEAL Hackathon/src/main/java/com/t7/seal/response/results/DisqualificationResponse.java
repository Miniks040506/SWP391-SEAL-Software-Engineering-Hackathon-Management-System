package com.t7.seal.response.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "DisqualificationResponse", description = "Response payload for disqualification.")
public record DisqualificationResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
        @Schema(
                description = "Whether sued by.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID issuedBy,
        @Schema(
                description = "Whether sued by name.",
                example = "issued by name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String issuedByName,
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
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for round name.",
                example = "round name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundName,
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
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String reason,
        @Schema(
                description = "API-returned value for evidence url.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String evidenceUrl,
        @Schema(
                description = "API-returned value for appeal note.",
                example = "appeal note example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String appealNote,
        @Schema(
                description = "API-returned value for appeal status.",
                example = "PENDING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String appealStatus,
        @Schema(
                description = "API-returned value for submission status.",
                example = "PENDING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String submissionStatus,
        @Schema(
                description = "API-returned value for team status.",
                example = "PENDING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamStatus,
        @Schema(
                description = "Timestamp for issued.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime issuedAt,
        @Schema(
                description = "API-returned value for ranking recalculated.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean rankingRecalculated,
        @Schema(
                description = "Number of cleared award.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int clearedAwardCount
) {
}