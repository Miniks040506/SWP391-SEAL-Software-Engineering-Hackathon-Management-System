package com.t7.seal.request.criteria;

import java.util.List;
import java.util.UUID;

public record CreateEventCriteriaRequest(
        UUID criteriaId,
        String nameOverride,
        String descriptionOverride,
        String rubricOverride,
        Double weightOverride,
        Double maxScoreOverride,
        Boolean isTechnicalOverride,
        List<UUID> appliesToRoundIds,
        Integer displayOrder
) {}
