package com.t7.seal.response.calibration;

import java.util.List;
import java.util.UUID;

public record CalibrationDistributionResponse(
        UUID calibrationRoundId,
        List<CriterionDistributionResponse> distributions) {}
