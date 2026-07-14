package com.t7.seal.response.mentor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "MentorFeedbackResponse", description = "Response payload for mentor feedback.")
public record MentorFeedbackResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID teamId,
        @Schema(
                description = "API-returned value for team name.",
                example = "team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamName,
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
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
                description = "API-returned value for category.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String category,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String content,
        @Schema(
                description = "API-returned value for visibility.",
                example = "PUBLISHED",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String visibility,
        @Schema(
                description = "API-returned value for visible to team.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean visibleToTeam,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt,
        @Schema(
                description = "Timestamp for published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime publishedAt
) {
}