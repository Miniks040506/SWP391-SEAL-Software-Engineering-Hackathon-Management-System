package com.t7.seal.response.track;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "MentorAssignmentResponse", description = "Response payload for mentor assignment.")
public record MentorAssignmentResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "UUID reference to the mentor user.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID mentorUserId,
        @Schema(
                description = "API-returned value for mentor name.",
                example = "mentor name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String mentorName,
        @Schema(
                description = "Timestamp for assigned.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime assignedAt
) {
}