package com.t7.seal.response.system;

import java.util.UUID;

public record JudgeVarianceResponse(
        UUID judgeId, String judgeType,
        Double meanScore, Double variance,
        Integer scoreCount
) {}
