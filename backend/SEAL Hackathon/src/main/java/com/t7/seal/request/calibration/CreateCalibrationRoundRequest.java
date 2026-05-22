package com.t7.seal.request.calibration;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateCalibrationRoundRequest(
        UUID eventId, UUID sampleSubmissionId,
        Object benchmarkScores, String description,
        LocalDateTime startAt,
        LocalDateTime endAt, Boolean mandatory)
{}
