package com.t7.seal.request.calibration;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record CalibrationScoreItemRequest(@NotNull UUID eventCriteriaId, @NotNull Double value) {}
