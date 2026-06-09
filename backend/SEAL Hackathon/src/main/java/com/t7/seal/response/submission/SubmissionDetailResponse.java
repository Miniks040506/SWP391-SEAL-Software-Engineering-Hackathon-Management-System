package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


public record SubmissionDetailResponse(
        UUID id,
        UUID eventId,
        String eventName,
        UUID teamId,
        String teamName,
        UUID leaderId,
        String leaderName,
        UUID trackId,
        String trackName,
        UUID roundId,
        String roundName,
        String note,
        String status,
        Integer submissionNumber,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        Boolean roundSubmissionLocked,
        LocalDateTime roundSubmissionLockedAt,
        List<SubmissionLinkResponse> links
) {
}