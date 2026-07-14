package com.t7.seal.request.calibration;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(name = "SubmitCalibrationScoreRequest", description = "Request payload for submit calibration score.")
public record SubmitCalibrationScoreRequest(
        @Schema(
                description = "Collection of scores.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotEmpty List<@Valid CalibrationScoreItemRequest> scores
) {}
