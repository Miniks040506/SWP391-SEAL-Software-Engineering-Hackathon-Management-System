package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record SubmissionDetailResponse(
        UUID id, UUID teamId, UUID roundId,
        String note, String status, Integer submissionNumber,
        LocalDateTime submittedAt,
        List<SubmissionLinkResponse> links
) {}
