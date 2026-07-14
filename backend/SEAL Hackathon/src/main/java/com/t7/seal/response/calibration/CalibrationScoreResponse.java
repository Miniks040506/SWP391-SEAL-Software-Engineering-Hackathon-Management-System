package com.t7.seal.response.calibration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "CalibrationScoreResponse", description = "Response payload for calibration score.")
public record CalibrationScoreResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "UUID reference to the calibration round.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID calibrationRoundId,
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID judgeId,
        @Schema(
                description = "Event criteria UUID.",
                example = "0cfa724d-9d3b-5576-af11-77ae9e87b4d1",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventCriteriaId,
        @Schema(
                description = "Business value or score value.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double value,
        @Schema(
                description = "API-returned value for deviation from benchmark.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double deviationFromBenchmark,
        @Schema(
                description = "Reviewer comment.",
                example = "Detailed reviewer comment.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String comment
) {
}