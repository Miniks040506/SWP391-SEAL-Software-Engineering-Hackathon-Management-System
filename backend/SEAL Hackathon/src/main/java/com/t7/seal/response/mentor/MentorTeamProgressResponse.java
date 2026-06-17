package com.t7.seal.response.mentor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MentorTeamProgressResponse(
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
        LocalDateTime updatedAt,
        List<MentorTeamRoundProgressResponse> roundProgress
) {
}
