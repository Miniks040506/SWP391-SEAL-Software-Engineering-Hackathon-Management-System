package com.t7.seal.response.grading;

import java.time.LocalDateTime;
import java.util.UUID;

public record JudgeSubmissionAssignmentResponse(
        UUID submissionId,
        UUID teamId,
        String teamName,
        String projectTitle,
        UUID trackId,
        String trackName,
        UUID roundId,
        String roundName,
        String submissionStatus,
        Integer submissionNumber,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        boolean roundSubmissionLocked,
        LocalDateTime roundSubmissionLockedAt,
        long confirmedScoreCount,
        long criteriaCount,
        String gradingStatus
) {
}
