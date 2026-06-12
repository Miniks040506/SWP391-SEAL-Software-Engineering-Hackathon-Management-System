package com.t7.seal.request.round;


import java.util.UUID;

public record UpdateAdvanceRuleRequest(
        String ruleType,
        UUID trackId,
        Boolean global,
        Integer topN,
        Double minScore,
        Double topPercent,
        Integer wildCardSlots,
        Integer priority,
        String description,
        Boolean active
) {
}
