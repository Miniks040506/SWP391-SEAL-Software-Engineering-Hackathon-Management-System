package com.t7.seal.request.calibration;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record CalibrationScoreItemRequest(
        @NotNull UUID eventCriteriaId,
        @NotNull Double value,
        @Size(max = 2000) String comment
) {}
