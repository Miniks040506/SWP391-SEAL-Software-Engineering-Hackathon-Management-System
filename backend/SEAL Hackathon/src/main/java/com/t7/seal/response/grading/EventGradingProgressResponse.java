package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "EventGradingProgressResponse", description = "Response payload for event grading progress.")
public record EventGradingProgressResponse(
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
                description = "Number of round.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int roundCount,
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
                description = "Number of expected final score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long expectedFinalScoreCount,
        @Schema(
                description = "Number of confirmed score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long confirmedScoreCount,
        @Schema(
                description = "API-returned value for percent.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        double percent,
        @Schema(
                description = "Collection of rounds.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<RoundGradingProgressResponse> rounds
) {
}