package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.calibration.*;
import com.t7.seal.service.CalibrationService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class CalibrationController {

    private final CalibrationService calibrationService;

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @PostMapping({"/calibrations", "/events/{eventId}/calibration-rounds"})
    public ResponseEntity<CalibrationRoundResponse> createCalibrationRound(
            @PathVariable(value = "eventId", required = false) UUID eventId,
            @Valid @RequestBody CreateCalibrationRoundRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .createCalibrationRound(eventId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')")
    @GetMapping({"/calibrations/events/{eventId}", "/events/{eventId}/calibration-rounds"})
    public ResponseEntity<List<CalibrationRoundResponse>> getCalibrationRoundsByEvent(
            @PathVariable("eventId") UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getCalibrationRoundsByEvent(eventId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping("/calibrations/my")
    public ResponseEntity<List<CalibrationRoundResponse>> getMyCalibrationRounds(
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService.getMyCalibrationRounds(authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @GetMapping("/calibrations/managed")
    public ResponseEntity<List<CalibrationRoundResponse>> getManagedCalibrationRounds(
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService.getManagedCalibrationRounds(authentication));
    }

    @PreAuthorize("hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')")
    @GetMapping({"/calibrations/{calibrationId}", "/calibration-rounds/{calibrationId}"})
    public ResponseEntity<CalibrationRoundDetailResponse> getCalibrationRoundById(
            @PathVariable("calibrationId") UUID calibrationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getCalibrationRoundById(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @PatchMapping({"/calibrations/{calibrationId}", "/calibration-rounds/{calibrationId}"})
    public ResponseEntity<CalibrationRoundResponse> updateCalibrationRound(
            @PathVariable("calibrationId") UUID calibrationId,
            @Valid @RequestBody UpdateCalibrationRoundRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .updateCalibrationRound(calibrationId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({"/calibrations/{calibrationId}/score-sheet", "/calibration-rounds/{calibrationId}/score-sheet"})
    public ResponseEntity<CalibrationScoreSheetResponse> getScoreSheet(
            @PathVariable("calibrationId") UUID calibrationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getScoreSheet(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @PostMapping({"/calibrations/{calibrationId}/scores", "/calibration-rounds/{calibrationId}/scores"})
    public ResponseEntity<List<CalibrationScoreResponse>> submitCalibrationScore(
            @PathVariable("calibrationId") UUID calibrationId,
            @Valid @RequestBody SubmitCalibrationScoreRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .submitCalibrationScores(calibrationId, request, authentication));
    }

    @PreAuthorize("hasRole('JUDGE')")
    @GetMapping({"/calibrations/{calibrationId}/my-scores", "/calibration-rounds/{calibrationId}/my-scores"})
    public ResponseEntity<List<CalibrationScoreResponse>> getMyScores(
            @PathVariable("calibrationId") UUID calibrationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getMyScores(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('JUDGE') or hasRole('COORDINATOR') or hasRole('ADMIN')")
    @GetMapping({"/calibrations/{calibrationId}/distribution", "/calibration-rounds/{calibrationId}/distribution"})
    public ResponseEntity<CalibrationDistributionResponse> getDistribution(
            @PathVariable("calibrationId") UUID calibrationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .getDistribution(calibrationId, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR') or hasRole('ADMIN')")
    @PostMapping({"/calibrations/{calibrationId}/publish-distribution", "/calibration-rounds/{calibrationId}/publish-distribution"})
    public ResponseEntity<CalibrationRoundResponse> publishDistribution(
            @PathVariable("calibrationId") UUID calibrationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(calibrationService
                .publishDistribution(calibrationId, authentication));
    }
}
