package com.t7.seal.response.system;

import java.util.UUID;

public record JudgeVarianceResponse(
        UUID judgeId,
        String hashedJudgeId,
        String judgeType,
        Double meanScore,
        Double variance,
        Double standardDeviation,
        Double minScore,
        Double maxScore,
        Integer scoreCount,
        Boolean highVariance
) {}
