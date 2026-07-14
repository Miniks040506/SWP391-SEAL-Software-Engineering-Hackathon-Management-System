package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "JudgeAssignmentProgressResponse", description = "Response payload for judge assignment progress.")
public record JudgeAssignmentProgressResponse(
        @Schema(
                description = "UUID reference to the assignment.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID assignmentId,
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID judgeId,
        @Schema(
                description = "API-returned value for judge name.",
                example = "judge name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeName,
        @Schema(
                description = "API-returned value for judge email.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeEmail,
        @Schema(
                description = "API-returned value for judge type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeType,
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
                description = "Collection of submissions.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<SubmissionGradingProgressResponse> submissions
) {
}