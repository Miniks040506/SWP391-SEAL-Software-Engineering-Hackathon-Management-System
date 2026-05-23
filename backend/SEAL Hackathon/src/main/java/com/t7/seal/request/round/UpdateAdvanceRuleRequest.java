package com.t7.seal.request.round;

public record UpdateAdvanceRuleRequest(
        Integer topN, Double minScore,
        Double topPercent,
        String description,
        Boolean active
) {}
