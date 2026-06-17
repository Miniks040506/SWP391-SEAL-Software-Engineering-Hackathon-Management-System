package com.t7.seal.response.mentor;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record MentorTeamDetailResponse(
        UUID teamId,
        String teamName,
        String projectTitle,
        String description,
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
        List<MentorTeamMemberResponse> members,
        List<MentorTeamRoundProgressResponse> submissions
) {
}
