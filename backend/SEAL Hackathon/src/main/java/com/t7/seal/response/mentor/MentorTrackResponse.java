package com.t7.seal.response.mentor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "MentorTrackResponse", description = "Response payload for mentor track.")
public record MentorTrackResponse(
        @Schema(
                description = "UUID reference to the assignment.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID assignmentId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for track name.",
                example = "track name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackName,
        @Schema(
                description = "API-returned value for track description.",
                example = "track description example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackDescription,
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
                description = "API-returned value for event status.",
                example = "ACTIVE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventStatus,
        @Schema(
                description = "Maximum number of teams.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer maxTeams,
        @Schema(
                description = "Minimum team size.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer minMembers,
        @Schema(
                description = "Maximum team size.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer maxMembers,
        @Schema(
                description = "Number of team.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long teamCount,
        @Schema(
                description = "Number of submitted submission.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long submittedSubmissionCount,
        @Schema(
                description = "Timestamp for assigned.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime assignedAt
) {
}