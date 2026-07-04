package com.t7.seal.response.coordinator;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CoordinatorTeamDetailResponse(
        UUID teamId,
        String teamName,
        String projectTitle,
        String description,
        String status,
        String registrationStatus,
        UUID eventId,
        String eventName,
        UUID trackId,
        String trackName,
        UUID leaderId,
        String leaderName,
        String leaderEmail,
        String joinCode,
        boolean joinCodeEnabled,
        int memberCount,
        long submissionCount,
        long submittedSubmissionCount,
        long missingSubmissionCount,
        String latestSubmissionStatus,
        LocalDateTime registeredAt,
        UUID registrationReviewedById,
        String registrationReviewedByName,
        LocalDateTime registrationReviewedAt,
        String registrationRejectionReason,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        List<CoordinatorTeamMemberResponse> members,
        List<CoordinatorTeamSubmissionProgressResponse> submissions
) {
}
