package com.t7.seal.response.grading;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "ScoreSheetResponse", description = "Response payload for score sheet.")
public record ScoreSheetResponse(
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
                description = "API-returned value for confirmed.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean confirmed,
        @Schema(
                description = "API-returned value for submission locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean submissionLocked,
        @Schema(
                description = "API-returned value for grading locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean gradingLocked,
        @Schema(
                description = "API-returned value for calibration completed.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean calibrationCompleted,
        @Schema(
                description = "API-returned value for can edit.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean canEdit,
        @Schema(
                description = "Collection of scores.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<ScoreResponse> scores
) {
}