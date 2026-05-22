package com.t7.seal.response.system;

import java.util.List;
import java.util.UUID;

public record VarianceDashboardResponse(
        UUID eventId, UUID roundId,
        List<JudgeVarianceResponse> judgeVariances,
        List<CriteriaVarianceResponse> criteriaVariances
) {}