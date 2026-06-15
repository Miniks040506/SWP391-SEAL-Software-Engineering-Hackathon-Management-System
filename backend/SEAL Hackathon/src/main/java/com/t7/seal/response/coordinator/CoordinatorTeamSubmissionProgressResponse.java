package com.t7.seal.response.coordinator;

import java.time.LocalDateTime;
import java.util.UUID;

public record CoordinatorTeamSubmissionProgressResponse(
        UUID roundId,
        String roundName,
        Integer roundOrderIndex,
        String roundStatus,
        UUID submissionId,
        String submissionStatus,
        Integer submissionNumber,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        int linkCount,
        String note
) {
}
