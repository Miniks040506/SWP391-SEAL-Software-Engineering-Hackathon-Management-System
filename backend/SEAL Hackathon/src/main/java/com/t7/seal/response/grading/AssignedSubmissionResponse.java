package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "AssignedSubmissionResponse", description = "Response payload for assigned submission.")
public record AssignedSubmissionResponse(
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
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SUBMITTED", "LATE", "DISQUALIFIED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for graded.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean graded,
        @Schema(
                description = "API-returned value for grading status.",
                example = "DRAFT",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String gradingStatus,
        @Schema(
                description = "Number of draft score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long draftScoreCount,
        @Schema(
                description = "Number of confirmed score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long confirmedScoreCount,
        @Schema(
                description = "Number of criteria.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long criteriaCount,
        @Schema(
                description = "API-returned value for grading locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean gradingLocked,
        @Schema(
                description = "Timestamp for grading locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime gradingLockedAt
) {
}