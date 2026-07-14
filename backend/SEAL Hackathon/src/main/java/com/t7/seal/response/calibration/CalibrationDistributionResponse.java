package com.t7.seal.response.calibration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "CalibrationDistributionResponse", description = "Response payload for calibration distribution.")
public record CalibrationDistributionResponse(
        @Schema(
                description = "UUID reference to the calibration round.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID calibrationRoundId,
        @Schema(
                description = "API-returned value for published.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean published,
        @Schema(
                description = "Timestamp for distribution published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime distributionPublishedAt,
        @Schema(
                description = "API-returned value for total score rows.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long totalScoreRows,
        @Schema(
                description = "Collection of distributions.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<CriterionDistributionResponse> distributions
) {
}
