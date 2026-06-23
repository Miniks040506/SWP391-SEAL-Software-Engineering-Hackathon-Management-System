package com.t7.seal.service.impl;

import com.t7.seal.entities.CalibrationRound;
import com.t7.seal.entities.Submission;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.CalibrationRoundRepository;
import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.calibration.*;
import com.t7.seal.service.CalibrationService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class CalibrationServiceImpl implements CalibrationService {

    private final CalibrationRoundRepository calibrationRoundRepository;

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

    private CalibrationRound findRound(UUID calibrationRoundId) {
        if (calibrationRoundId == null) {
            throw new BadRequestException("calibrationRoundId is required.");
        }
        return calibrationRoundRepository.findById(calibrationRoundId)
                .orElseThrow(() -> new NotFoundException("Calibration round not found."));
    }

    private UUID resolveEventId(UUID pathEventId, UUID bodyEventId) {
        if (pathEventId != null && bodyEventId != null && !pathEventId.equals(bodyEventId)) {
            throw new BadRequestException("Path eventId does not match request eventId.");
        }
        return pathEventId != null ? pathEventId : bodyEventId;
    }

    private void ensureSubmissionBelongsToEvent(Submission submission, UUID eventId) {
        if (submission.getRound() == null || submission.getRound().getEvent() == null
                || !submission.getRound().getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Sample submission does not belong to the selected event.");
        }
    }

    private void validateTimeRange(LocalDateTime startAt, LocalDateTime endAt) {
        if (startAt == null) {
            throw new BadRequestException("startAt is required.");
        }
        if (endAt == null) {
            throw new BadRequestException("endAt is required.");
        }
        if (!endAt.isAfter(startAt)) {
            throw new BadRequestException("endAt must be after startAt.");
        }
    }
}
