package com.t7.seal.request.mentor;

import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CreateMentorFeedbackRequest(
        UUID submissionId,
        UUID roundId,
        String category,
        @Size(max = 5000, message = "Feedback content must be at most 5000 characters")
        String content,
        Boolean publish,
        Boolean visibleToTeam
) {
}
