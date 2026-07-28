package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "EventCompetitionRoundResponse", description = "Response payload for event competition round.")
public record EventCompetitionRoundResponse(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for round name.",
                example = "round name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundName,
        @Schema(
                description = "API-returned value for order index.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer orderIndex,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "REGISTRATION",
                allowableValues = {"DRAFT", "REGISTRATION", "ONGOING", "JUDGING", "COMPLETED", "CANCELLED", "ARCHIVED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Whether this is the final round.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean isFinal,
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
                description = "API-returned value for open.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean open,
        @Schema(
                description = "API-returned value for submission locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean submissionLocked,
        @Schema(
                description = "API-returned value for can submit.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean canSubmit,
        @Schema(
                description = "API-returned value for can access round.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean canAccessRound,
        @Schema(
                description = "API-returned value for advancement confirmed.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean advancementConfirmed,
        @Schema(
                description = "Timestamp for advancement confirmed.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime advancementConfirmedAt,
        @Schema(
                description = "API-returned value for advanced.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean advanced,
        @Schema(
                description = "API-returned value for eliminated.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean eliminated,
        @Schema(
                description = "API-returned value for advance reason.",
                example = "advance reason example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String advanceReason,
        @Schema(
                description = "Ranking position.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer rankPosition,
        @Schema(
                description = "Weighted total score.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Double totalScore,
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
        @Schema(
                description = "API-returned value for submission status.",
                example = "REGISTRATION",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String submissionStatus,
        @Schema(
                description = "API-returned value for submission number.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer submissionNumber,
        @Schema(
                description = "Timestamp for submitted.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submittedAt,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt,
        @Schema(
                description = "Number of link.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long linkCount,
        String problemStatementUrl,
        String problemStatementFileName
) {
}
