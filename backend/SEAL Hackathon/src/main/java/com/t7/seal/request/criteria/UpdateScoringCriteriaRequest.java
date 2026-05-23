package com.t7.seal.request.criteria;

public record UpdateScoringCriteriaRequest(
        String name, String description,
        String rubric, Double maxScore,
        Double defaultWeight, String category,
        Boolean isTechnical, Boolean isActive
) {}
