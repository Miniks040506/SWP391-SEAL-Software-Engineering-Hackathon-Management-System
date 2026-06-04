package com.t7.seal.response.criteria;

import java.util.List;
import java.util.UUID;

public record EventCriteriaResponse(
        UUID id, UUID eventId,
        UUID criteriaId,
        String templateName,
        String templateCategory,
        Boolean isCustom,
        String nameOverride,
        String descriptionOverride,
        String rubricOverride,
        Double weightOverride,
        Double maxScoreOverride,
        Boolean isTechnicalOverride,
        String effectiveName,
        String effectiveDescription,
        String effectiveRubric,
        Double effectiveWeight,
        Double effectiveMaxScore,
        Boolean effectiveIsTechnical,
        List<UUID> appliesToRoundIds,
        Integer displayOrder,
        Boolean isActive
) {
}
