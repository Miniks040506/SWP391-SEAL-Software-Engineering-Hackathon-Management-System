package com.t7.seal.request.round;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record AssignJudgeRequest(
        @NotNull UUID judgeId,
        UUID trackId,
        @Min(1) Integer totalToScore
) {}
