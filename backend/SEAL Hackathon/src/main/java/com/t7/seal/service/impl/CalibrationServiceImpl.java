package com.t7.seal.service.impl;

import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.calibration.*;
import com.t7.seal.service.CalibrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalibrationServiceImpl implements CalibrationService {

    @Override
    @Transactional
    public CalibrationRoundResponse createCalibrationRound(
            UUID eventId,
            CreateCalibrationRoundRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalibrationRoundResponse> getCalibrationRoundsByEvent(
            UUID eventId,
            Authentication authentication
    ) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public CalibrationRoundDetailResponse getCalibrationRoundById(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    @Transactional
    public CalibrationRoundResponse updateCalibrationRound(
            UUID calibrationRoundId,
            UpdateCalibrationRoundRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    @Transactional(readOnly = true)
    public CalibrationScoreSheetResponse getScoreSheet(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    @Transactional
    public List<CalibrationScoreResponse> submitCalibrationScores(
            UUID calibrationRoundId,
            SubmitCalibrationScoreRequest request,
            Authentication authentication
    ) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalibrationScoreResponse> getMyScores(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        return List.of();
    }

    @Override
    @Transactional(readOnly = true)
    public CalibrationDistributionResponse getDistribution(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        return null;
    }

    @Override
    @Transactional
    public CalibrationRoundResponse publishDistribution(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        return null;
    }
}
