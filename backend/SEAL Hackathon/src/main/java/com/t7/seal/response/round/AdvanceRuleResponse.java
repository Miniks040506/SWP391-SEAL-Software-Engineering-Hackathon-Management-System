package com.t7.seal.response.round;

import java.util.UUID;

public record AdvanceRuleResponse(
        UUID id, UUID roundId,
        UUID trackId, String ruleType,
        Integer topN, Double minScore,
        Double topPercent, Boolean active
) {}
