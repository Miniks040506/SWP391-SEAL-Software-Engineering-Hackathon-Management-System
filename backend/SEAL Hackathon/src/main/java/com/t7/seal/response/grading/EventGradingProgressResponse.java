package com.t7.seal.response.grading;

import java.util.List;
import java.util.UUID;

public record EventGradingProgressResponse(
        UUID eventId,
        String eventName,
        String eventStatus,
        int roundCount,
        int totalAssignedSubmissions,
        int completedAssignedSubmissions,
        int pendingSubmissions,
        int draftSavedSubmissions,
        int submittedSubmissions,
        int lockedSubmissions,
        long expectedFinalScoreCount,
        long confirmedScoreCount,
        double percent,
        List<RoundGradingProgressResponse> rounds
) {
}
