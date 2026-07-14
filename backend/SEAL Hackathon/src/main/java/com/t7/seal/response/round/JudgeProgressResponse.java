package com.t7.seal.response.round;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "JudgeProgressResponse", description = "Response payload for judge progress.")
public record JudgeProgressResponse(
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID judgeId,
        @Schema(
                description = "API-returned value for judge name.",
                example = "judge name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeName,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for completed.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int completed,
        @Schema(
                description = "API-returned value for total.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int total
) {
}