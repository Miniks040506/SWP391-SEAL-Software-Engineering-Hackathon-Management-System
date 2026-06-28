package com.t7.seal.response.calibration;

import java.time.LocalDateTime;
import java.util.UUID;

public record CalibrationRoundDetailResponse(
        UUID id, UUID eventId, UUID sampleSubmissionId, UUID sampleRoundId,
        Object benchmarkScores, String description,
        LocalDateTime startAt, LocalDateTime endAt,
        Boolean mandatory, LocalDateTime distributionPublishedAt)
{}
