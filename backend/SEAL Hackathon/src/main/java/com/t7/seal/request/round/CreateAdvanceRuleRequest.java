package com.t7.seal.request.round;

import jakarta.validation.constraints.NotBlank;

import java.util.UUID;

public record CreateAdvanceRuleRequest(
        @NotBlank String ruleType,
        UUID trackId,
        Integer topN,
        Double minScore,
        Double topPercent,
        String description
) {}
