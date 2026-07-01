package com.t7.seal.response.system;

import java.util.UUID;

public record CriteriaVarianceResponse(
        UUID eventCriteriaId,
        String criteriaName,
        String category,
        Boolean technical,
        Double meanScore,
        Double variance,
        Double standardDeviation,
        Double minScore,
        Double maxScore,
        Integer scoreCount,
        Integer judgeCount,
        Boolean highVariance
) {}
