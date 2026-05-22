package com.t7.seal.request.grading;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record ScoreItemRequest(
        @NotNull UUID eventCriteriaId,
        @NotNull Double value, String comment
) {}
