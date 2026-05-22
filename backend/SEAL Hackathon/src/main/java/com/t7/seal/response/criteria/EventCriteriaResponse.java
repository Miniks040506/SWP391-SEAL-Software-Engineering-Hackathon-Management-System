package com.t7.seal.response.criteria;

import java.util.UUID;

public record EventCriteriaResponse(
        UUID id, UUID eventId, UUID criteriaId,
        String effectiveName, String effectiveDescription,
        String effectiveRubric, Double effectiveWeight, Double effectiveMaxScore,
        Boolean effectiveIsTechnical, Integer displayOrder, Boolean isActive
) {}
