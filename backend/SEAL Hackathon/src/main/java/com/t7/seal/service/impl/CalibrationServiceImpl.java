package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ConflictException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.exception.UnauthorizedException;
import com.t7.seal.repository.*;
import com.t7.seal.request.calibration.CalibrationScoreItemRequest;
import com.t7.seal.request.calibration.CreateCalibrationRoundRequest;
import com.t7.seal.request.calibration.SubmitCalibrationScoreRequest;
import com.t7.seal.request.calibration.UpdateCalibrationRoundRequest;
import com.t7.seal.response.calibration.*;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;
import com.t7.seal.service.AuditLogService;
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
    private final SubmissionLinkRepository submissionLinkRepository;
    private final HackathonEventRepository eventRepository;
    private final SubmissionRepository submissionRepository;
    private final CalibrationScoreRepository calibrationScoreRepository;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    @Override
    @Transactional
    public CalibrationRoundResponse createCalibrationRound(
            UUID pathEventId,
            CreateCalibrationRoundRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCoordinatorOrAdmin(actor);
        UUID eventId = resolveEventId(pathEventId, request.eventId());

        if (eventId == null) {
            throw new BadRequestException("eventId is required.");
        }
        if (request.sampleSubmissionId() == null) {
            throw new BadRequestException("sampleSubmissionId is required.");
        }
        validateTimeRange(request.startAt(), request.endAt());

        HackathonEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new NotFoundException("Event not found."));
        Submission sample = submissionRepository.findDetailById(request.sampleSubmissionId())
                .orElseThrow(() -> new NotFoundException("Sample submission not found."));
        ensureSubmissionBelongsToEvent(sample, event.getId());

        Map<String, Float> benchmarkScores = parseBenchmarkScores(request.benchmarkScores());
        validateBenchmarkCriteria(event.getId(), sample, benchmarkScores);

        CalibrationRound calibrationRound = CalibrationRound.builder()
                .event(event)
                .sampleSubmission(sample)
                .benchmarkScores(benchmarkScores)
                .description(request.description())
                .startAt(request.startAt())
                .endAt(request.endAt())
                .isMandatory(request.mandatory() == null || request.mandatory())
                .build();

        CalibrationRound saved = calibrationRoundRepository.save(calibrationRound);
        auditLogService.record(
                actor,
                AuditActionType.CALIBRATION_ROUND_CREATED,
                "calibration_rounds",
                saved.getId(),
                null,
                Map.of(
                        "eventId", event.getId(),
                        "sampleSubmissionId", sample.getId(),
                        "mandatory", saved.getIsMandatory()
                ),
                Map.of("source", "SPRINT_3_PERIOD_1")
        );

        return toRoundResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalibrationRoundResponse> getCalibrationRoundsByEvent(
            UUID eventId,
            Authentication authentication
    ) {
        User user = currentUserService.getCurrentUser(authentication);

        if (eventId == null) {
            throw new BadRequestException("eventId is required.");
        }

        eventRepository.findById(eventId).orElseThrow(() -> new NotFoundException("Event not found."));
        ensureCanAccessEventCalibration(user, eventId);

        return calibrationRoundRepository.findByEventIdOrderByStartAtAsc(eventId)
                .stream()
                .map(this::toRoundResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public CalibrationRoundDetailResponse getCalibrationRoundById(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        CalibrationRound calibrationRound = findRound(calibrationRoundId);
        User user = currentUserService.getCurrentUser(authentication);
        ensureCanAccessEventCalibration(user, calibrationRound.getEvent().getId());
        return toRoundDetailResponse(calibrationRound);
    }

    @Override
    @Transactional
    public CalibrationRoundResponse updateCalibrationRound(
            UUID calibrationRoundId,
            UpdateCalibrationRoundRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCoordinatorOrAdmin(actor);

        CalibrationRound calibrationRound = findRound(calibrationRoundId);
        if (calibrationRound.isDistributionPublished()) {
            throw new ConflictException("Cannot update calibration round after distribution is published.");
        }

        Map<String, Object> before = Map.of(
                "description", nullSafe(calibrationRound.getDescription()),
                "startAt", calibrationRound.getStartAt(),
                "endAt", calibrationRound.getEndAt(),
                "mandatory", calibrationRound.getIsMandatory()
        );

        if (request.description() != null) {
            calibrationRound.setDescription(request.description());
        }
        if (request.startAt() != null) {
            calibrationRound.setStartAt(request.startAt());
        }
        if (request.endAt() != null) {
            calibrationRound.setEndAt(request.endAt());
        }
        if (request.mandatory() != null) {
            calibrationRound.setIsMandatory(request.mandatory());
        }
        if (request.benchmarkScores() != null) {
            Map<String, Float> benchmarkScores = parseBenchmarkScores(request.benchmarkScores());
            validateBenchmarkCriteria(
                    calibrationRound.getEvent().getId(),
                    calibrationRound.getSampleSubmission(),
                    benchmarkScores
            );
            calibrationRound.setBenchmarkScores(benchmarkScores);
        }
        validateTimeRange(calibrationRound.getStartAt(), calibrationRound.getEndAt());

        CalibrationRound saved = calibrationRoundRepository.save(calibrationRound);
        auditLogService.record(
                actor,
                AuditActionType.CALIBRATION_ROUND_UPDATED,
                "calibration_rounds",
                saved.getId(),
                before,
                Map.of(
                        "description", nullSafe(saved.getDescription()),
                        "startAt", saved.getStartAt(),
                        "endAt", saved.getEndAt(),
                        "mandatory", saved.getIsMandatory()
                ),
                Map.of("source", "SPRINT_3_PERIOD_1")
        );

        return toRoundResponse(saved);
    }

    @Override
    @Transactional(readOnly = true)
    public CalibrationScoreSheetResponse getScoreSheet(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        CalibrationRound calibrationRound = findRound(calibrationRoundId);
        Judge judge = currentJudge(authentication);

        ensureJudgeCanAccessCalibration(judge, calibrationRound);

        List<EventCriteria> criteria = activeCriteriaForCalibration(calibrationRound);
        List<CalibrationScoreResponse> scores = calibrationScoreRepository
                .findByCalibrationRoundIdAndJudgeId(calibrationRound.getId(), judge.getId())
                .stream()
                .map(this::toScoreResponse)
                .toList();

        return toScoreSheetResponse(calibrationRound, criteria, scores);
    }

    @Override
    @Transactional
    public List<CalibrationScoreResponse> submitCalibrationScores(
            UUID calibrationRoundId,
            SubmitCalibrationScoreRequest request,
            Authentication authentication
    ) {
        CalibrationRound calibrationRound = findRound(calibrationRoundId);
        Judge judge = currentJudge(authentication);

        ensureJudgeCanAccessCalibration(judge, calibrationRound);
        ensureCalibrationOpen(calibrationRound);

        if (request.scores() == null || request.scores().isEmpty()) {
            throw new BadRequestException("At least one calibration score is required.");
        }

        List<EventCriteria> activeCriteria = activeCriteriaForCalibration(calibrationRound);
        Map<UUID, EventCriteria> criteriaById = activeCriteria.stream()
                .collect(Collectors.toMap(
                        EventCriteria::getId,
                        Function.identity()
                ));

        ensureNoDuplicateCriteria(request.scores());

        List<CalibrationScore> savedScores = new ArrayList<>();
        for (CalibrationScoreItemRequest item : request.scores()) {
            EventCriteria criteria = criteriaById.get(item.eventCriteriaId());
            if (criteria == null) {
                throw new BadRequestException("Event criteria is not active for this calibration round: " + item.eventCriteriaId());
            }

            Float value = toFloat(item.value(), "score value");
            validateScoreValue(value, criteria);

            CalibrationScore score = calibrationScoreRepository
                    .findByCalibrationRoundIdAndJudgeIdAndEventCriteriaId(
                            calibrationRound.getId(),
                            judge.getId(),
                            criteria.getId()
                    )
                    .orElseGet(() -> CalibrationScore.builder()
                            .calibrationRound(calibrationRound)
                            .judge(judge)
                            .eventCriteria(criteria)
                            .build());

            score.setValue(value);
            savedScores.add(calibrationScoreRepository.save(score));
        }

        auditLogService.record(
                judge.getUser(),
                AuditActionType.CALIBRATION_SCORE_SUBMITTED,
                "calibration_rounds",
                calibrationRound.getId(),
                null,
                Map.of(
                        "judgeId", judge.getId(),
                        "scoreCount", savedScores.size()
                ),
                Map.of("source", "SPRINT_3_PERIOD_1")
        );

        return savedScores.stream()
                .sorted(Comparator.comparing(
                        score -> score.getEventCriteria().getDisplayOrder()
                ))
                .map(this::toScoreResponse)
                .toList();
    }

    @Override
    @Transactional(readOnly = true)
    public List<CalibrationScoreResponse> getMyScores(
            UUID calibrationRoundId,
            Authentication authentication
    ) {
        CalibrationRound calibrationRound = findRound(calibrationRoundId);
        Judge judge = currentJudge(authentication);

        ensureJudgeCanAccessCalibration(judge, calibrationRound);

        return calibrationScoreRepository
                .findByCalibrationRoundIdAndJudgeId(calibrationRound.getId(), judge.getId())
                .stream()
                .map(this::toScoreResponse)
                .toList();
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
                .collect(Collectors.toMap(
                        EventCriteria::getId,
                        Function.identity()
                ));

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

    private List<EventCriteria> activeCriteriaForEventAndSampleRound(
            UUID eventId, Submission sample
    ) {
        UUID sampleRoundId = sample.getRound() == null ? null : sample.getRound().getId();
        return eventCriteriaRepository
                .findByEventIdAndIsActiveTrueOrderByDisplayOrderAsc(eventId)
                .stream()
                .filter(criteria -> sampleRoundId == null
                        || criteria.appliesToRound(sampleRoundId))
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

    private CalibrationDistributionResponse buildDistribution(
            CalibrationRound calibrationRound,
            List<EventCriteria> criteria,
            List<CalibrationScore> scores
    ) {
        Map<UUID, List<CalibrationScore>> scoresByCriteria = scores.stream()
                .collect(Collectors.groupingBy(score -> score.getEventCriteria().getId(), HashMap::new, Collectors.toList()));

        List<CriterionDistributionResponse> distributions = criteria.stream()
                .map(criteriaItem -> buildCriterionDistribution(calibrationRound, criteriaItem, scoresByCriteria.get(criteriaItem.getId())))
                .toList();

        return new CalibrationDistributionResponse(
                calibrationRound.getId(),
                calibrationRound.isDistributionPublished(),
                calibrationRound.getDistributionPublishedAt(),
                (long) scores.size(),
                distributions
        );
    }

    private CriterionDistributionResponse buildCriterionDistribution(
            CalibrationRound calibrationRound,
            EventCriteria criteria,
            List<CalibrationScore> scores
    ) {
        List<Double> values = (scores == null) ? List.of() : scores.stream()
                .map(score -> score.getValue().doubleValue()).toList();

        Double mean = values.isEmpty() ? null : values.stream()
                .mapToDouble(Double::doubleValue).average().orElse(0.0);
        Double min = values.isEmpty() ? null : values.stream()
                .mapToDouble(Double::doubleValue).min().orElse(0.0);
        Double max = values.isEmpty() ? null : values.stream()
                .mapToDouble(Double::doubleValue).max().orElse(0.0);

        Double std = values.isEmpty() ? null : standardDeviation(values, mean);
        Float benchmark = calibrationRound.getBenchmarkScore(criteria.getId());

        return new CriterionDistributionResponse(
                criteria.getId(),
                criteria.getEffectiveName(),
                benchmark == null ? null : benchmark.doubleValue(),
                (long) values.size(),
                mean,
                min,
                max,
                std
        );
    }

    private Double standardDeviation(List<Double> values, Double mean) {
        if (values == null || values.isEmpty() || mean == null) {
            return null;
        }

        double variance = values.stream()
                .mapToDouble(value -> Math.pow(value - mean, 2))
                .average()
                .orElse(0.0);

        return Math.sqrt(variance);
    }

    private CalibrationScoreSheetResponse toScoreSheetResponse(
            CalibrationRound calibrationRound,
            List<EventCriteria> criteria,
            List<CalibrationScoreResponse> scores
    ) {
        Submission sample = calibrationRound.getSampleSubmission();
        Team team = sample.getTeam();
        LocalDateTime now = LocalDateTime.now();

        long criteriaCount = criteria.size();
        boolean submitted = criteriaCount > 0 && scores.size() >= criteriaCount;

        return new CalibrationScoreSheetResponse(
                calibrationRound.getId(),
                calibrationRound.getEvent().getId(),
                sample.getId(),
                team == null ? null : team.getName(),
                team == null ? null : team.getProjectTitle(),
                sample.getNote(),
                calibrationRound.getStartAt(),
                calibrationRound.getEndAt(),
                calibrationRound.getIsMandatory(),
                calibrationRound.isDistributionPublished(),
                calibrationRound.getDistributionPublishedAt(),
                calibrationRound.isOpen(now) && !calibrationRound.isDistributionPublished(),
                submitted,
                now,
                submissionLinkRepository.findBySubmissionIdOrderByDisplayOrderAscCreatedAtAsc(sample.getId())
                        .stream()
                        .map(this::toLinkResponse)
                        .toList(),
                criteria.stream().map(this::toEventCriteriaResponse).toList(),
                scores
        );
    }

    private CalibrationRoundResponse toRoundResponse(CalibrationRound calibrationRound) {
        return new CalibrationRoundResponse(
                calibrationRound.getId(),
                calibrationRound.getEvent().getId(),
                calibrationRound.getSampleSubmission().getId(),
                calibrationRound.getDescription(),
                calibrationRound.getStartAt(),
                calibrationRound.getEndAt(),
                calibrationRound.getIsMandatory(),
                calibrationRound.getDistributionPublishedAt()
        );
    }

    private CalibrationRoundDetailResponse toRoundDetailResponse(
            CalibrationRound calibrationRound
    ) {
        return new CalibrationRoundDetailResponse(
                calibrationRound.getId(),
                calibrationRound.getEvent().getId(),
                calibrationRound.getSampleSubmission().getId(),
                calibrationRound.getBenchmarkScores(),
                calibrationRound.getDescription(),
                calibrationRound.getStartAt(),
                calibrationRound.getEndAt(),
                calibrationRound.getIsMandatory(),
                calibrationRound.getDistributionPublishedAt()
        );
    }

    private CalibrationScoreResponse toScoreResponse(CalibrationScore score) {
        return new CalibrationScoreResponse(
                score.getId(),
                score.getCalibrationRound().getId(),
                score.getJudge().getId(),
                score.getEventCriteria().getId(),
                score.getValue() == null ? null : score.getValue().doubleValue(),
                score.getDeviationFromBenchmark() == null
                        ? null : score.getDeviationFromBenchmark().doubleValue()
        );
    }

    private SubmissionLinkResponse toLinkResponse(SubmissionLink link) {
        return new SubmissionLinkResponse(
                link.getId(),
                link.getLinkType() == null ? null : link.getLinkType().name(),
                link.getUrl(),
                link.getLabel(),
                link.getStorageProvider() == null
                        ? null : link.getStorageProvider().name(),
                link.getObjectKey(),
                link.getOriginalFileName(),
                link.getContentType(),
                link.getFileSizeBytes(),
                link.getRepoMetadata(),
                link.getIsPrimary(),
                link.getDisplayOrder(),
                link.getCreatedAt(),
                link.getUpdatedAt()
        );
    }

    private EventCriteriaResponse toEventCriteriaResponse(EventCriteria criteria) {
        return new EventCriteriaResponse(
                criteria.getId(),
                criteria.getEvent().getId(),
                criteria.getCriteria() == null ? null : criteria.getCriteria().getId(),
                criteria.getCriteria() == null ? null : criteria.getCriteria().getName(),
                criteria.getCriteria() == null
                        || criteria.getCriteria().getCategory() == null
                        ? null : criteria.getCriteria().getCategory().name(),
                criteria.isCustomCriteria(),
                criteria.getNameOverride(),
                criteria.getDescriptionOverride(),
                criteria.getRubricOverride(),
                toDouble(criteria.getWeightOverride()),
                toDouble(criteria.getMaxScoreOverride()),
                criteria.getIsTechnicalOverride(),
                criteria.getEffectiveName(),
                criteria.getEffectiveDescription(),
                criteria.getEffectiveRubric(),
                toDouble(criteria.getEffectiveWeight()),
                toDouble(criteria.getEffectiveMaxScore()),
                criteria.getEffectiveIsTechnical(),
                criteria.getAppliesToRoundIds(),
                criteria.getDisplayOrder(),
                criteria.getIsActive()
        );
    }

    private Double toDouble(Float value) {
        return value == null ? null : value.doubleValue();
    }

    private Object nullSafe(Object value) {
        return value == null ? "" : value;
    }
}
