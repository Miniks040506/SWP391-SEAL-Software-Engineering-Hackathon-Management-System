package com.t7.seal.response.system;

import java.util.List;
import java.util.UUID;

public record VarianceDashboardResponse(
        UUID eventId,
        String eventName,
        UUID roundId,
        UUID trackId,
        String criteriaType,
        String judgeType,
        Integer totalScoreCount,
        Integer totalJudgeCount,
        Integer totalCriteriaCount,
        Double overallMean,
        Double overallVariance,
        Double overallStandardDeviation,
        Double averageCriterionVariance,
        Double averageJudgeVariance,
        List<JudgeVarianceResponse> judgeVariances,
        List<CriteriaVarianceResponse> criteriaVariances
) {
}
