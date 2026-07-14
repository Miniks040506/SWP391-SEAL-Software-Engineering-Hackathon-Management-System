package com.t7.seal.request.calibration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "UpdateCalibrationRoundRequest", description = "Request payload for update calibration round.")
public record UpdateCalibrationRoundRequest(
        @Schema(
                description = "UUID reference to the sample submission.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid"
        )
        UUID sampleSubmissionId,
        @Schema(
                description = "Client-supplied value for benchmark scores."
        )
        Object benchmarkScores,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description,
        @Schema(
                description = "Start timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time"
        )
        LocalDateTime startAt,
        @Schema(
                description = "End timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime endAt,
        @Schema(
                description = "Client-supplied value for mandatory.",
                example = "true"
        )
        Boolean mandatory
) {}
