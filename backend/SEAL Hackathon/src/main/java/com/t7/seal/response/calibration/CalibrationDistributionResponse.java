package com.t7.seal.response.calibration;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CalibrationDistributionResponse(
        UUID calibrationRoundId,
        Boolean published,
        LocalDateTime distributionPublishedAt,
        Long totalScoreRows,
        List<CriterionDistributionResponse> distributions
) {}

