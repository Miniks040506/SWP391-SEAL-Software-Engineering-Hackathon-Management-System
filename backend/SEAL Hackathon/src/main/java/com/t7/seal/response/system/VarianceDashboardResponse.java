package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "VarianceDashboardResponse", description = "Response payload for variance dashboard.")
public record VarianceDashboardResponse(
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "API-returned value for event name.",
                example = "event name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventName,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for criteria type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String criteriaType,
        @Schema(
                description = "API-returned value for judge type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeType,
        @Schema(
                description = "Number of total score.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer totalScoreCount,
        @Schema(
                description = "Number of total judge.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer totalJudgeCount,
        @Schema(
                description = "Number of total criteria.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer totalCriteriaCount,
        @Schema(
                description = "API-returned value for overall mean.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double overallMean,
        @Schema(
                description = "API-returned value for overall variance.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double overallVariance,
        @Schema(
                description = "API-returned value for overall standard deviation.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double overallStandardDeviation,
        @Schema(
                description = "API-returned value for variance threshold.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double varianceThreshold,
        @Schema(
                description = "API-returned value for average criterion variance.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double averageCriterionVariance,
        @Schema(
                description = "API-returned value for average judge variance.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double averageJudgeVariance,
        @Schema(
                description = "Collection of judge variances.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<JudgeVarianceResponse> judgeVariances,
        @Schema(
                description = "Collection of criteria variances.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<CriteriaVarianceResponse> criteriaVariances
) {
}