package com.t7.seal.request.calibration;

import java.time.LocalDateTime;

public record UpdateCalibrationRoundRequest(
        Object benchmarkScores,
        String description,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Boolean mandatory
) {}
