package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissionSummaryResponse(
        UUID id, UUID roundId,
        String roundName, String status, Integer submissionNumber,
        LocalDateTime submittedAt)
{}
