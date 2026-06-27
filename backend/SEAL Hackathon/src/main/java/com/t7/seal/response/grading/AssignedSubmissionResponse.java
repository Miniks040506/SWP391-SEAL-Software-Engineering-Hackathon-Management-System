package com.t7.seal.response.grading;

import java.time.LocalDateTime;
import java.util.UUID;

public record AssignedSubmissionResponse(
        UUID submissionId,
        UUID teamId,
        String teamName,
        UUID roundId,
        UUID trackId,
        String status,
        boolean graded,
        String gradingStatus,
        long draftScoreCount,
        long confirmedScoreCount,
        long criteriaCount,
        boolean gradingLocked,
        LocalDateTime gradingLockedAt
) {
}
