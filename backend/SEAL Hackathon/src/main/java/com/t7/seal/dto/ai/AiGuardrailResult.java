package com.t7.seal.dto.ai;

import com.t7.seal.domain.AiIntent;
import com.t7.seal.domain.AiSafetyDecision;
import com.t7.seal.domain.AiSafetyRiskType;

public record AiGuardrailResult(
        AiSafetyDecision decision,
        AiSafetyRiskType riskType,
        AiIntent intent,
        int severity,
        String reason,
        String safeAnswer
) {
    public static AiGuardrailResult allow(AiIntent intent) {
        return new AiGuardrailResult(
                AiSafetyDecision.ALLOW,
                AiSafetyRiskType.NONE,
                intent,
                0,
                null,
                null
        );
    }

    public boolean blocked() {
        return decision == AiSafetyDecision.BLOCK;
    }
}
