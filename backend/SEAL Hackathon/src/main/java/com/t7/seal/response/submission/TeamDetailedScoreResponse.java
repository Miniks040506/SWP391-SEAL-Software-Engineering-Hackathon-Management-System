package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "TeamDetailedScoreResponse", description = "Response payload for team detailed score.")
public record TeamDetailedScoreResponse(
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
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
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
                description = "Whether this score belongs to the final round.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean finalRound,
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
                description = "Weighted total score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double totalScore,
        @Schema(
                description = "Ranking position.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer rankPosition,
        @Schema(
                description = "API-returned value for advanced.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean advanced,
        @Schema(
                description = "Number of judge.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer judgeCount,
        @Schema(
                description = "Timestamp for published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime publishedAt,
        @Schema(
                description = "Collection of criteria scores.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<TeamScoreCriterionResponse> criteriaScores
) {
}
