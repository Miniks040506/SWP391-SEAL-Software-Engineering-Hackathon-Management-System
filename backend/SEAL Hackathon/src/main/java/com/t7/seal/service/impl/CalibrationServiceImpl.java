package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.CalibrationRoundRepository;
import com.t7.seal.repository.EventCriteriaRepository;
import com.t7.seal.repository.JudgeRepository;
import com.t7.seal.repository.RoundJudgeAssignmentRepository;
import com.t7.seal.request.calibration.CalibrationScoreItemRequest;
import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.calibration.*;
import com.t7.seal.service.CalibrationService;
import com.t7.seal.service.CurrentUserService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class CalibrationServiceImpl implements CalibrationService {

    private final CalibrationRoundRepository calibrationRoundRepository;
    private final ObjectMapper objectMapper;
    private final EventCriteriaRepository eventCriteriaRepository;
    private final JudgeRepository judgeRepository;
    private final RoundJudgeAssignmentRepository assignmentRepository;

    private final CurrentUserService currentUserService;

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

    private Map<String, Float> parseBenchmarkScores(Object raw) {
        if (raw == null) {
            return null;
        }
        Map<String, Object> input = objectMapper.convertValue(raw, new TypeReference<>() {
        });
        if (input == null || input.isEmpty()) {
            return new LinkedHashMap<>();
        }
        Map<String, Float> result = new LinkedHashMap<>();
        for (Map.Entry<String, Object> entry : input.entrySet()) {
            if (entry.getKey() == null || entry.getKey().isBlank()) {
                throw new BadRequestException("benchmarkScores contains a blank criterion id.");
            }
            try {
                UUID.fromString(entry.getKey());
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("benchmarkScores key must be an eventCriteria UUID: " + entry.getKey());
            }
            result.put(entry.getKey(), toFloat(entry.getValue(), "benchmark score"));
        }
        return result;
    }

    private Float toFloat(Object raw, String fieldName) {
        if (raw == null) {
            throw new BadRequestException(fieldName + " is required.");
        }
        if (raw instanceof Number number) {
            return number.floatValue();
        }
        try {
            return Float.parseFloat(raw.toString());
        } catch (NumberFormatException ex) {
            throw new BadRequestException(fieldName + " must be a number.");
        }
    }

    private void validateBenchmarkCriteria(UUID eventId, Submission sample, Map<String, Float> benchmarkScores) {
        if (benchmarkScores == null || benchmarkScores.isEmpty()) {
            return;
        }
        List<EventCriteria> activeCriteria = activeCriteriaForEventAndSampleRound(eventId, sample);
        Set<UUID> activeIds = activeCriteria.stream()
                .map(EventCriteria::getId)
                .collect(Collectors.toSet());
        Map<UUID, EventCriteria> byId = activeCriteria.stream()
                .collect(Collectors.toMap(EventCriteria::getId, Function.identity()));
        for (Map.Entry<String, Float> entry : benchmarkScores.entrySet()) {
            UUID criteriaId = UUID.fromString(entry.getKey());
            if (!activeIds.contains(criteriaId)) {
                throw new BadRequestException("Benchmark criterion is not active for this calibration round: " + criteriaId);
            }
            validateScoreValue(entry.getValue(), byId.get(criteriaId));
        }
    }

    private List<EventCriteria> activeCriteriaForCalibration(CalibrationRound calibrationRound) {
        return activeCriteriaForEventAndSampleRound(
                calibrationRound.getEvent().getId(),
                calibrationRound.getSampleSubmission()
        );
    }

    private List<EventCriteria> activeCriteriaForEventAndSampleRound(UUID eventId, Submission sample) {
        UUID sampleRoundId = sample.getRound() == null ? null : sample.getRound().getId();
        return eventCriteriaRepository.findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(eventId)
                .stream()
                .filter(criteria -> sampleRoundId == null || criteria.appliesToRound(sampleRoundId))
                .toList();
    }

    private void validateScoreValue(Float value, EventCriteria criteria) {
        if (value == null) {
            throw new BadRequestException("Score value is required.");
        }
        if (value < 0) {
            throw new BadRequestException("Score value must be greater than or equal to 0.");
        }
        Float maxScore = criteria.getEffectiveMaxScore();
        if (maxScore != null && value > maxScore) {
            throw new BadRequestException("Score value must not exceed max score " + maxScore + " for " + criteria.getEffectiveName() + ".");
        }
    }

    private void ensureNoDuplicateCriteria(List<CalibrationScoreItemRequest> items) {
        Set<UUID> seen = new HashSet<>();
        for (CalibrationScoreItemRequest item : items) {
            if (item.eventCriteriaId() == null) {
                throw new BadRequestException("eventCriteriaId is required.");
            }
            if (!seen.add(item.eventCriteriaId())) {
                throw new BadRequestException("Duplicate calibration score for criterion: " + item.eventCriteriaId());
            }
        }
    }

    private void ensureCalibrationOpen(CalibrationRound calibrationRound) {
        LocalDateTime now = LocalDateTime.now();
        if (calibrationRound.isDistributionPublished()) {
            throw new ConflictException("Calibration distribution is already published.");
        }
        if (!calibrationRound.isOpen(now)) {
            throw new ConflictException("Calibration round is not currently open.");
        }
    }

    private void ensureCanAccessEventCalibration(User user, UUID eventId) {
        if (canCoordinate(user)) {
            return;
        }
        if (!user.isJudge()) {
            throw new UnauthorizedException("Only judges or coordinators can access calibration rounds.");
        }
        Judge judge = judgeRepository.findByUserId(user.getId())
                .orElseThrow(() -> new UnauthorizedException("Judge profile was not found."));
        ensureJudgeCanAccessEvent(judge, eventId);
    }

    private void ensureJudgeCanAccessCalibration(Judge judge, CalibrationRound calibrationRound) {
        ensureJudgeCanAccessEvent(judge, calibrationRound.getEvent().getId());
    }

    private void ensureJudgeCanAccessEvent(Judge judge, UUID eventId) {
        if (judge == null || judge.getUser() == null || !judge.getUser().isActive()) {
            throw new UnauthorizedException("Judge account is not ACTIVE.");
        }
        if (Boolean.TRUE.equals(judge.getIsTemporary()) && !judge.isTemporaryActive(LocalDateTime.now())) {
            throw new UnauthorizedException("Temporary judge account has expired.");
        }
        if (!assignmentRepository.existsByJudgeIdAndEventId(judge.getId(), eventId)) {
            throw new UnauthorizedException("This calibration round is not assigned to you.");
        }
    }

    private Judge currentJudge(Authentication authentication) {
        User user = currentUserService.getCurrentUser(authentication);
        if (!user.isJudge()) {
            throw new UnauthorizedException("Only judges can use calibration scoring.");
        }
        if (!user.isActive()) {
            throw new UnauthorizedException("Judge account is not ACTIVE.");
        }
        Judge judge = judgeRepository.findByUserId(user.getId())
                .orElseThrow(() ->
                        new UnauthorizedException("Judge profile was not found."));
        if (Boolean.TRUE.equals(judge.getIsTemporary())
                && !judge.isTemporaryActive(LocalDateTime.now())) {
            throw new UnauthorizedException("Temporary judge account has expired.");
        }
        return judge;
    }

    private boolean canCoordinate(User user) {
        return user != null
                && (user.getRole() == UserRole.COORDINATOR
                || user.getRole() == UserRole.ADMIN);
    }

    private void ensureCoordinatorOrAdmin(User user) {
        if (!canCoordinate(user)) {
            throw new UnauthorizedException("Only coordinator or admin can manage calibration rounds.");
        }
    }


}
