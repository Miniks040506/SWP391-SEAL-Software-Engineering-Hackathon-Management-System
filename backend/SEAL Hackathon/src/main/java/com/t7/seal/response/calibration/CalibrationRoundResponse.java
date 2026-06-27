package com.t7.seal.response.calibration;

import java.time.LocalDateTime;
import java.util.UUID;

public record CalibrationRoundResponse(
        UUID id, UUID eventId,
        UUID sampleSubmissionId,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Boolean mandatory,
        long assignedJudgeCount,
        long submittedJudgeCount,
        long pendingJudgeCount,
        LocalDateTime distributionPublishedAt)
{}
