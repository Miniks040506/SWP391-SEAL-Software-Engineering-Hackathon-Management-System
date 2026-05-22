package com.t7.seal.response.grading;

import java.time.LocalDateTime;
import java.util.UUID;

public record ScoreResponse(
        UUID id, UUID submissionId, UUID judgeId, UUID eventCriteriaId,
        Double value, String comment, Boolean isDraft, LocalDateTime scoredAt
) {}