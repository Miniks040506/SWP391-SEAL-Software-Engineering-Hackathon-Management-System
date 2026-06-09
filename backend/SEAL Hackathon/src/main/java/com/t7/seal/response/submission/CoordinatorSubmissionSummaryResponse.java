package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.UUID;

public record CoordinatorSubmissionSummaryResponse(
        UUID id,
        UUID eventId,
        String eventName,
        UUID teamId,
        String teamName,
        UUID trackId,
        String trackName,
        UUID roundId,
        String roundName,
        String status,
        Integer submissionNumber,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        long linkCount,
        boolean late
) {
}
