package com.t7.seal.response.calibration;

import java.util.UUID;

public record CalibrationScoreResponse(
        UUID id, UUID calibrationRoundId, UUID judgeId, UUID eventCriteriaId,
        Double value, Double deviationFromBenchmark)
{}
