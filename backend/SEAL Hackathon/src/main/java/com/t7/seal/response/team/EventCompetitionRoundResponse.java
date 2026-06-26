package com.t7.seal.response.team;

import java.time.LocalDateTime;
import java.util.UUID;

public record EventCompetitionRoundResponse(
        UUID roundId,
        String roundName,
        Integer orderIndex,
        String description,
        String status,
        Boolean isFinal,
        LocalDateTime submissionDeadline,
        LocalDateTime judgingDeadline,
        LocalDateTime submissionLockedAt,
        Boolean open,
        Boolean submissionLocked,
        Boolean canSubmit,
        Boolean canAccessRound,
        Boolean advancementConfirmed,
        LocalDateTime advancementConfirmedAt,
        Boolean advanced,
        Boolean eliminated,
        String advanceReason,
        Integer rankPosition,
        Double totalScore,
        UUID submissionId,
        String submissionStatus,
        Integer submissionNumber,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        Long linkCount
) {
}
