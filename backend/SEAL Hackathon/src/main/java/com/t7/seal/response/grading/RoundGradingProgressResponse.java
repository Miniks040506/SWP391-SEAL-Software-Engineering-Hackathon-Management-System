package com.t7.seal.response.grading;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record RoundGradingProgressResponse(
        UUID roundId,
        UUID eventId,
        String roundName,
        String roundStatus,
        LocalDateTime submissionLockedAt,
        LocalDateTime gradingLockedAt,
        boolean submissionLocked,
        boolean gradingLocked,
        boolean canLockGrading,
        String lockWarning,
        int judgeAssignmentCount,
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
        List<JudgeAssignmentProgressResponse> judgeAssignments
) {
}
