package com.t7.seal.request.calibration;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SubmitCalibrationScoreRequest(
        @NotEmpty List<@Valid CalibrationScoreItemRequest> scores
) {}
