package com.t7.seal.response.criteria;

import java.util.UUID;

public record ScoringCriteriaResponse(
        UUID id, String name,
        String description, String rubric,
        Double maxScore, Double defaultWeight,
        String category, Boolean isTechnical,
        Boolean isDefault, Boolean isActive
) {}
