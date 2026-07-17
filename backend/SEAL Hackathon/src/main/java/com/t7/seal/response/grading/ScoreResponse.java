package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "ScoreResponse", description = "Response payload for score.")
public record ScoreResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
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
                description = "Reviewer comment.",
                example = "Detailed reviewer comment.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String comment,
        @Schema(
                description = "Whether the resource is still a draft.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isDraft,
        @Schema(
                description = "Timestamp for scored.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime scoredAt,
        @Schema(
                description = "Optimistic concurrency version.",
                example = "3",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long version,
        @Schema(
                description = "Timestamp of the latest score update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt
) {
}
