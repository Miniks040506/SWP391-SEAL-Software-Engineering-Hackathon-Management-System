package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.UUID;

public record SubmissionResponse(
        UUID id, UUID teamId, UUID roundId,
        String status, Integer submissionNumber,
        LocalDateTime submittedAt
) {}
