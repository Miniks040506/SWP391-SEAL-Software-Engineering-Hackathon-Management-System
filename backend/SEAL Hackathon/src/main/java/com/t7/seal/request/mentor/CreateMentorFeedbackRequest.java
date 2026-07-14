package com.t7.seal.request.mentor;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(name = "CreateMentorFeedbackRequest", description = "Request payload for create mentor feedback.")
public record CreateMentorFeedbackRequest(
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid"
        )
        UUID submissionId,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid"
        )
        UUID roundId,
        @Schema(
                description = "Client-supplied value for category.",
                example = "GENERAL"
        )
        String category,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example"
        )
        @Size(max = 5000, message = "Feedback content must be at most 5000 characters")
        String content,
        @Schema(
                description = "Client-supplied value for publish.",
                example = "true"
        )
        Boolean publish,
        @Schema(
                description = "Client-supplied value for visible to team.",
                example = "true"
        )
        Boolean visibleToTeam
) {}
