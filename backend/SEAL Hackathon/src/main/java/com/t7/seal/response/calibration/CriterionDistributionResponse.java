package com.t7.seal.response.calibration;

import java.util.UUID;

public record CriterionDistributionResponse(
        UUID eventCriteriaId,
        String criteriaName,
        String category,
        Boolean technical,
        Double benchmarkScore,
        Long judgeCount,
        Double mean,
        Double min,
        Double max,
        Double standardDeviation
) {}

