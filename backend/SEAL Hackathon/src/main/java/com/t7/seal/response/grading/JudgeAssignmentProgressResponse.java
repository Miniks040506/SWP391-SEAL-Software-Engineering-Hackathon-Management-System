package com.t7.seal.response.grading;

import java.util.List;
import java.util.UUID;

public record JudgeAssignmentProgressResponse(
        UUID assignmentId,
        UUID judgeId,
        String judgeName,
        String judgeEmail,
        String judgeType,
        UUID trackId,
        String trackName,
        int totalAssignedSubmissions,
        int completedAssignedSubmissions,
        int pendingSubmissions,
        int draftSavedSubmissions,
        int submittedSubmissions,
        int lockedSubmissions,
        long criteriaCount,
        long draftScoreCount,
        long confirmedScoreCount,
        long expectedFinalScoreCount,
        double percent,
        List<SubmissionGradingProgressResponse> submissions
) {
}
