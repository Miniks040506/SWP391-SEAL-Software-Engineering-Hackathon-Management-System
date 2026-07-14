package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "RoundDetailResponse", description = "Response payload for round detail.")
public record RoundDetailResponse(
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
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "API-returned value for order index.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer orderIndex,
        @Schema(
                description = "Whether this is the final round.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isFinal,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "UPCOMING",
                allowableValues = {"UPCOMING", "OPEN", "PENDING_LOCK", "CLOSED", "JUDGING", "RESULTS_READY"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
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
                description = "Submission deadline.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submissionDeadline,
        @Schema(
                description = "Judging deadline.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime judgingDeadline,
        @Schema(
                description = "Timestamp for submission locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submissionLockedAt,
        @Schema(
                description = "Timestamp for grading locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime gradingLockedAt,
        @Schema(
                description = "Timestamp for advancement confirmed.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime advancementConfirmedAt
) {
}