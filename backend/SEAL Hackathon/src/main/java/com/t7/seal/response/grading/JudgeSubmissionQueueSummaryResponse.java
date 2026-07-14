package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "JudgeSubmissionQueueSummaryResponse", description = "Response payload for judge submission queue summary.")
public record JudgeSubmissionQueueSummaryResponse(
        @Schema(
                description = "API-returned value for total assigned.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long totalAssigned,
        @Schema(
                description = "API-returned value for pending.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long pending,
        @Schema(
                description = "API-returned value for draft saved.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long draftSaved,
        @Schema(
                description = "API-returned value for submitted.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long submitted,
        @Schema(
                description = "API-returned value for locked.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long locked
) {
}