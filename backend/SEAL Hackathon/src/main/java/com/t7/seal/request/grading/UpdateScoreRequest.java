package com.t7.seal.request.grading;

import jakarta.validation.constraints.NotNull;

public record UpdateScoreRequest(@NotNull Double value, String comment) {}
