package com.t7.seal.response.system;

import java.util.UUID;

public record CriteriaVarianceResponse(
        UUID eventCriteriaId, String criteriaName,
        Boolean technical, Double meanScore,
        Double variance, Integer scoreCount
) {}