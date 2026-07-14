package com.t7.seal.response.mentor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "MentorTeamRoundProgressResponse", description = "Response payload for mentor team round progress.")
public record MentorTeamRoundProgressResponse(
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
                description = "API-returned value for round order index.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer roundOrderIndex,
        @Schema(
                description = "API-returned value for round status.",
                example = "UPCOMING",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundStatus,
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
        @Schema(
                description = "API-returned value for submission status.",
                example = "UPCOMING",
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
        int linkCount,
        @Schema(
                description = "Optional business note.",
                example = "Example test note.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String note
) {
}