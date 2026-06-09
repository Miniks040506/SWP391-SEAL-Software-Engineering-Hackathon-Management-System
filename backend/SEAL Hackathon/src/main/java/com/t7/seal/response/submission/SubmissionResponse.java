package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SubmissionResponse(
        UUID id,
        UUID teamId,
        String teamName,
        UUID trackId,
        String trackName,
        UUID roundId,
        String roundName,
        String note,
        String status,
        Integer submissionNumber,
        LocalDateTime submittedAt,
        LocalDateTime updatedAt,
        List<SubmissionLinkResponse> links
) {
}
