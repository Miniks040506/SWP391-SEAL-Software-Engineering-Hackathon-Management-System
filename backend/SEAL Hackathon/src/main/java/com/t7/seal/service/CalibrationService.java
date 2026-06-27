package com.t7.seal.service;

import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.calibration.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface CalibrationService {

    CalibrationRoundResponse createCalibrationRound(UUID eventId,
                                                    CreateCalibrationRoundRequest request,
                                                    Authentication authentication);

    List<CalibrationRoundResponse> getCalibrationRoundsByEvent(UUID eventId,
                                                               Authentication authentication);

    List<CalibrationRoundResponse> getMyCalibrationRounds(Authentication authentication);

    List<CalibrationRoundResponse> getManagedCalibrationRounds(Authentication authentication);

    CalibrationRoundDetailResponse getCalibrationRoundById(UUID calibrationRoundId,
                                                           Authentication authentication);

    CalibrationRoundResponse updateCalibrationRound(UUID calibrationRoundId,
                                                    UpdateCalibrationRoundRequest request,
                                                    Authentication authentication);

    CalibrationScoreSheetResponse getScoreSheet(UUID calibrationRoundId,
                                                Authentication authentication);

    List<CalibrationScoreResponse> submitCalibrationScores(UUID calibrationRoundId,
                                                           SubmitCalibrationScoreRequest request,
                                                           Authentication authentication);

    List<CalibrationScoreResponse> getMyScores(UUID calibrationRoundId,
                                               Authentication authentication);

    CalibrationDistributionResponse getDistribution(UUID calibrationRoundId,
                                                    Authentication authentication);

    CalibrationRoundResponse publishDistribution(UUID calibrationRoundId,
                                                 Authentication authentication);
}
