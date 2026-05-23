package com.t7.seal.request.criteria;

import java.util.List;
import java.util.UUID;

public record UpdateEventCriteriaRequest(
        String nameOverride,
        String descriptionOverride,
        String rubricOverride,
        Double weightOverride,
        Double maxScoreOverride,
        Boolean isTechnicalOverride,
        Boolean isActive,
        List<UUID> appliesToRoundIds,
        Integer displayOrder
) {}
