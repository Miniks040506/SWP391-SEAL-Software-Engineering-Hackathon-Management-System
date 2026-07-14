package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "RoundOperationStatusResponse", description = "Response payload for round operation status.")
public record RoundOperationStatusResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "API-returned value for event status.",
                example = "UPCOMING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventStatus,
        @Schema(
                description = "API-returned value for round status.",
                example = "UPCOMING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundStatus,
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
                description = "API-returned value for can open.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean canOpen,
        @Schema(
                description = "API-returned value for can close.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean canClose,
        @Schema(
                description = "API-returned value for can lock submissions.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean canLockSubmissions,
        @Schema(
                description = "API-returned value for deadline configured.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean deadlineConfigured,
        @Schema(
                description = "API-returned value for criteria configured.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean criteriaConfigured,
        @Schema(
                description = "API-returned value for judge assignments configured.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean judgeAssignmentsConfigured,
        @Schema(
                description = "Number of criteria.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long criteriaCount,
        @Schema(
                description = "Number of track.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long trackCount,
        @Schema(
                description = "Collection of open blockers.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<String> openBlockers,
        @Schema(
                description = "Number of submitted or late submission.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long submittedOrLateSubmissionCount,
        @Schema(
                description = "Number of draft submission.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long draftSubmissionCount,
        @Schema(
                description = "Number of judge assignment.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long judgeAssignmentCount
) {
}