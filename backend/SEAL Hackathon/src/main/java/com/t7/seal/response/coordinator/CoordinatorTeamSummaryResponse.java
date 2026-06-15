package com.t7.seal.response.coordinator;

import java.time.LocalDateTime;
import java.util.UUID;

public record CoordinatorTeamSummaryResponse(
        UUID teamId,
        String teamName,
        String projectTitle,
        String status,
        UUID eventId,
        String eventName,
        UUID trackId,
        String trackName,
        UUID leaderId,
        String leaderName,
        String leaderEmail,
        int memberCount,
        long submissionCount,
        long submittedSubmissionCount,
        long missingSubmissionCount,
        String latestSubmissionStatus,
        LocalDateTime registeredAt,
        LocalDateTime createdAt,
        LocalDateTime updatedAt
) {
}
