package com.t7.seal.dto.ai;

public record AiProviderResult(
        String answer,
        String provider,
        String model,
        boolean usedExternalModel
) {}
