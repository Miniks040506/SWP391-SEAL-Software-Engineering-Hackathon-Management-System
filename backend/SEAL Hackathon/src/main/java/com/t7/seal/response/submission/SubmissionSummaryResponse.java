package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "SubmissionSummaryResponse", description = "Response payload for submission summary.")
public record SubmissionSummaryResponse(
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
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SUBMITTED", "LATE", "DISQUALIFIED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for submission number.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer submissionNumber,
        @Schema(
                description = "Timestamp for submitted.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submittedAt,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt,
        @Schema(
                description = "API-returned value for round submission locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean roundSubmissionLocked,
        @Schema(
                description = "Timestamp for round submission locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime roundSubmissionLockedAt,
        @Schema(
                description = "Number of link.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long linkCount
) {
}