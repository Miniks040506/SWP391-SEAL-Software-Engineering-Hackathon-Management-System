package com.t7.seal.response.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Schema(name = "RankingResponse", description = "Response payload for ranking.")
public record RankingResponse(
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
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
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
                description = "API-returned value for project title.",
                example = "project title example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String projectTitle,
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
                description = "Whether this ranking belongs to the final round.",
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
                description = "API-returned value for tied.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean tied,
        @Schema(
                description = "API-returned value for tie group key.",
                example = "tie group key example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String tieGroupKey,
        @Schema(
                description = "API-returned value for tie group size.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer tieGroupSize,
        @Schema(
                description = "API-returned value for manual resolution required.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean manualResolutionRequired,
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
                description = "API-returned value for score breakdown.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Map<String, Map<String, Float>> scoreBreakdown,
        @Schema(
                description = "Timestamp for calculated.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime calculatedAt,
        @Schema(
                description = "API-returned value for published.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean published,
        @Schema(
                description = "API-returned value for advance reason.",
                example = "advance reason example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String advanceReason,
        @Schema(
                description = "API-returned value for submission status.",
                example = "ACTIVE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String submissionStatus,
        @Schema(
                description = "API-returned value for team status.",
                example = "ACTIVE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamStatus
) {
}
