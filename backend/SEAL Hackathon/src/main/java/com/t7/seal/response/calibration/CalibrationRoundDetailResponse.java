package com.t7.seal.response.calibration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "CalibrationRoundDetailResponse", description = "Response payload for calibration round detail.")
public record CalibrationRoundDetailResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "UUID reference to the sample submission.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID sampleSubmissionId,
        @Schema(
                description = "UUID reference to the sample round.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID sampleRoundId,
        @Schema(
                description = "API-returned value for benchmark scores.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object benchmarkScores,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "Start timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime startAt,
        @Schema(
                description = "End timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime endAt,
        @Schema(
                description = "API-returned value for mandatory.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean mandatory,
        @Schema(
                description = "Timestamp for distribution published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime distributionPublishedAt
) {
}