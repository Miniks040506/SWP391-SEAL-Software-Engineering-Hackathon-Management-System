package com.t7.seal.response.submission;

import java.util.UUID;

public record TeamScoreCriterionResponse(
        UUID eventCriteriaId,
        String criteriaName,
        String category,
        Boolean technical,
        Double averageScore,
        Double maxScore,
        Double weight,
        Integer judgeCount
) {}

