package com.t7.seal.response.grading;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissionGradingProgressResponse(
        UUID submissionId,
        UUID teamId,
        String teamName,
        UUID trackId,
        String trackName,
        UUID roundId,
        String roundName,
        String submissionStatus,
        String gradingStatus,
        long draftScoreCount,
        long confirmedScoreCount,
        long criteriaCount,
        boolean completed,
        boolean gradingLocked,
        LocalDateTime gradingLockedAt
) {
}
