package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "RoundGradingProgressResponse", description = "Response payload for round grading progress.")
public record RoundGradingProgressResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "API-returned value for round name.",
                example = "round name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundName,
        @Schema(
                description = "API-returned value for round status.",
                example = "UPCOMING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundStatus,
        @Schema(
                description = "Timestamp for submission locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submissionLockedAt,
        @Schema(
                description = "Timestamp for grading locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime gradingLockedAt,
        @Schema(
                description = "API-returned value for submission locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean submissionLocked,
        @Schema(
                description = "API-returned value for grading locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean gradingLocked,
        @Schema(
                description = "API-returned value for can lock grading.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean canLockGrading,
        @Schema(
                description = "API-returned value for lock warning.",
                example = "lock warning example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String lockWarning,
        @Schema(
                description = "Number of judge assignment.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int judgeAssignmentCount,
        @Schema(
                description = "API-returned value for total assigned submissions.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int totalAssignedSubmissions,
        @Schema(
                description = "API-returned value for completed assigned submissions.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int completedAssignedSubmissions,
        @Schema(
                description = "API-returned value for pending submissions.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int pendingSubmissions,
        @Schema(
                description = "API-returned value for draft saved submissions.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int draftSavedSubmissions,
        @Schema(
                description = "API-returned value for submitted submissions.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int submittedSubmissions,
        @Schema(
                description = "API-returned value for locked submissions.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int lockedSubmissions,
        @Schema(
                description = "Number of criteria.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long criteriaCount,
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
                description = "Number of expected final score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long expectedFinalScoreCount,
        @Schema(
                description = "API-returned value for percent.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        double percent,
        @Schema(
                description = "Collection of judge assignments.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<JudgeAssignmentProgressResponse> judgeAssignments
) {
}