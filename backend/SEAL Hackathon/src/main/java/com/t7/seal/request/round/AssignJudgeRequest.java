package com.t7.seal.request.round;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "AssignJudgeRequest", description = "Request payload for assign judge.")
public record AssignJudgeRequest(
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID judgeId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID trackId,
        @Schema(
                description = "Client-supplied value for total to score.",
                example = "1"
        )
        @Min(1) Integer totalToScore
) {}
