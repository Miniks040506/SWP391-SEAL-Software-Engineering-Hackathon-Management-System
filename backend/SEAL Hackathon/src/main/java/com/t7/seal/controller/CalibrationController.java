package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.response.calibration.CalibrationDistributionResponse;
import com.t7.seal.response.calibration.CalibrationRoundDetailResponse;
import com.t7.seal.response.calibration.CalibrationRoundResponse;
import com.t7.seal.response.calibration.CalibrationScoreResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/calibrations")
public class CalibrationController {
    @PostMapping("/calibrations")
    public ResponseEntity<CalibrationRoundResponse> createCalibrationRound(
            @Valid @RequestBody CreateCalibrationRoundRequest request
    ) {
        return null;
    }

    @GetMapping("/calibrations/events/{eventId}")
    public ResponseEntity<List<CalibrationRoundResponse>> getCalibrationRoundsByEvent(
            @PathVariable("eventId") UUID eventId
    ) {
        return null;
    }

    @GetMapping("/calibrations/{calibrationId}")
    public ResponseEntity<CalibrationRoundDetailResponse> getCalibrationRoundById(
            @PathVariable("calibrationId") UUID calibrationId
    ) {
        return null;
    }

    @PatchMapping("/calibrations/{calibrationId}")
    public ResponseEntity<CalibrationRoundResponse> updateCalibrationRound(
            @PathVariable("calibrationId")UUID calibrationId
    ) {
        return null;
    }

    @PostMapping("/calibrations/{calibrationId}/scores")
    public ResponseEntity<CalibrationScoreResponse> submitCalibrationScore(
            @PathVariable("calibrationId")UUID calibrationId,
            @Valid @RequestBody SubmitCalibrationScoreRequest request
    ) {
        return null;
    }

    @GetMapping("/calibrations/{calibrationId}/distribution")
    public ResponseEntity<CalibrationDistributionResponse> getDistribution(
            @PathVariable("calibrationId")UUID calibrationId
    ) {
        return null;
    }

    @PostMapping("/calibrations/{calibrationId}/publish-distribution")
    public ResponseEntity<CalibrationRoundResponse> publishDistribution(
            @PathVariable("calibrationId")UUID calibrationId
    ) {
        return null;
    }
}
