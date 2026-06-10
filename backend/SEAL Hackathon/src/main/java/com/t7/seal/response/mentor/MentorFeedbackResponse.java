package com.t7.seal.response.mentor;

import java.time.LocalDateTime;
import java.util.UUID;

public record MentorFeedbackResponse(
        UUID id,
        UUID teamId,
        String teamName,
        UUID submissionId,
        UUID roundId,
        String roundName,
        UUID mentorUserId,
        String mentorName,
        String category,
        String content,
        String visibility,
        Boolean visibleToTeam,
        LocalDateTime createdAt,
        LocalDateTime updatedAt,
        LocalDateTime publishedAt
) {
}
