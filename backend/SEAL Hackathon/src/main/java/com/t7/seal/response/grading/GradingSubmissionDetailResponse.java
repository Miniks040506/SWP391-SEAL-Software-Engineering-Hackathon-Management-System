package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;

import java.util.List;
import java.util.UUID;

@Schema(name = "GradingSubmissionDetailResponse", description = "Response payload for grading submission detail.")
public record GradingSubmissionDetailResponse(
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
        @Schema(
                description = "API-returned value for team name.",
                example = "team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamName,
        @Schema(
                description = "API-returned value for project title.",
                example = "project title example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String projectTitle,
        @Schema(
                description = "API-returned event name.",
                example = "SEAL Summer 2026",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventName,
        @Schema(
                description = "API-returned round name.",
                example = "Final Round",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundName,
        @Schema(
                description = "API-returned track name.",
                example = "Artificial Intelligence",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackName,
        @Schema(
                description = "API-returned submission status.",
                example = "SUBMITTED",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String submissionStatus,
        @Schema(
                description = "Optional business note.",
                example = "Example test note.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String note,
        @Schema(
                description = "Collection of links.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<SubmissionLinkResponse> links,
        @Schema(
                description = "Collection of criteria.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<EventCriteriaResponse> criteria
) {
}
