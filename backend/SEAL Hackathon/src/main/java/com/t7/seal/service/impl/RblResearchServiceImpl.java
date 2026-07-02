package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.dto.Stats;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.*;
import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.system.CriteriaVarianceResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.response.system.JudgeVarianceResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.ExportService;
import com.t7.seal.service.RblResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RblResearchServiceImpl implements RblResearchService {

    private static final String HASH_PREFIX = "SEAL-RBL-v1:";
    private static final double DEFAULT_VARIANCE_THRESHOLD = 3.0;

    private final CurrentUserService currentUserService;
    private final ExportService exportService;

    private final HackathonEventRepository hackathonEventRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final ScoreRepository scoreRepository;

    @Override
    @Transactional(readOnly = true)
    public VarianceDashboardResponse getVarianceDashboard(
            UUID eventId,
            UUID roundId,
            UUID trackId,
            String criteriaType,
            String judgeType,
            Authentication authentication
    ) {
        ensureCoordinatorOrAdmin(authentication);
        HackathonEvent event = requireEvent(eventId);
        validateRoundBelongsToEvent(roundId, eventId);
        validateTrackBelongsToEvent(trackId, eventId);

        String normalizedCriteriaType = normalizeCriteriaType(criteriaType);
        JudgeType judgeTypeFilter = parseJudgeType(judgeType);

        List<Score> scores = loadFilteredScores(event.getId(),
                roundId, trackId, normalizedCriteriaType, judgeTypeFilter);

        Stats overallStats = calculateStats(scores.stream()
                .map(score -> score.getValue().doubleValue())
                .toList());
        double varianceThreshold = event.getVarianceThresholdPoints() == null
                ? DEFAULT_VARIANCE_THRESHOLD
                : event.getVarianceThresholdPoints().doubleValue();

        Map<UUID, List<Score>> scoresByCriteria = scores.stream()
                .collect(Collectors.groupingBy(
                        score -> score.getEventCriteria().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<CriteriaVarianceResponse> criteriaVariances = scoresByCriteria.values().stream()
                .map(criteriaScores -> toCriteriaVariance(criteriaScores, varianceThreshold))
                .sorted(Comparator
                        .comparing((CriteriaVarianceResponse r)
                                -> Boolean.TRUE.equals(r.highVariance()) ? 0 : 1)
                        .thenComparing(
                                CriteriaVarianceResponse::standardDeviation,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        )
                        .thenComparing(
                                CriteriaVarianceResponse::criteriaName,
                                Comparator.nullsLast(String::compareToIgnoreCase)
                        )
                )
                .toList();

        Map<UUID, List<Score>> scoresByJudge = scores.stream()
                .collect(Collectors.groupingBy(
                        score -> score.getJudge().getId(),
                        LinkedHashMap::new,
                        Collectors.toList()
                ));

        List<JudgeVarianceResponse> judgeVariances = scoresByJudge.values().stream()
                .map(judgeScores -> toJudgeVariance(judgeScores, varianceThreshold))
                .sorted(Comparator
                        .comparing((JudgeVarianceResponse r)
                                -> Boolean.TRUE.equals(r.highVariance()) ? 0 : 1)
                        .thenComparing(
                                JudgeVarianceResponse::standardDeviation,
                                Comparator.nullsLast(Comparator.reverseOrder())
                        )
                )
                .toList();

        return new VarianceDashboardResponse(
                event.getId(),
                event.getName(),
                roundId,
                trackId,
                normalizedCriteriaType,
                normalizeNullable(judgeType),
                scores.size(),
                scoresByJudge.size(),
                scoresByCriteria.size(),
                overallStats.mean(),
                overallStats.variance(),
                overallStats.standardDeviation(),
                varianceThreshold,
                round(average(criteriaVariances.stream()
                        .map(CriteriaVarianceResponse::variance)
                        .toList())),
                round(average(judgeVariances.stream()
                        .map(JudgeVarianceResponse::variance)
                        .toList())),
                judgeVariances,
                criteriaVariances
        );
    }

    @Override
    @Transactional
    public ExportJobResponse exportAnonymizedDataset(
            UUID eventId,
            ExportRblDatasetRequest request,
            Authentication authentication
    ) {
        return exportService.exportEventRblDataset(eventId, request, authentication);
    }

    //HELPERS

    private User ensureCoordinatorOrAdmin(Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        if (actor.getRole() != UserRole.ADMIN && actor.getRole() != UserRole.COORDINATOR) {
            throw new ForbiddenException("Only coordinator or admin can access rbl research data.");
        }
        return actor;
    }

    private HackathonEvent requireEvent(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required");
        }
        return hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new BadRequestException("Event not found"));
    }

    private void validateRoundBelongsToEvent(UUID roundId, UUID eventId) {
        if (roundId == null) {
            return;
        }

        Round round = roundRepository.findById(roundId)
                .orElseThrow(() -> new BadRequestException("Round not found"));

        if (round.getEvent() == null || !round.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Round does not belong to the requested event.");
        }
    }

    private void validateTrackBelongsToEvent(UUID trackId, UUID eventId) {
        if (trackId == null) {
            return;
        }

        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new BadRequestException("Track not found"));

        if (track.getEvent() == null || !track.getEvent().getId().equals(eventId)) {
            throw new BadRequestException("Track does not belong to the requested event.");
        }
    }

    private List<Score> loadFilteredScores(
            UUID eventId,
            UUID roundId,
            UUID trackId,
            String criteriaTypeFilter,
            JudgeType judgeTypeFilter
    ) {
        return scoreRepository.findConfirmedScoresForRblDashboard(eventId, roundId, trackId)
                .stream()
                .filter(score -> matchesCriteriaType(score.getEventCriteria(), criteriaTypeFilter))
                .filter(score -> judgeTypeFilter == null
                        || judgeTypeFilter == score.getJudge().getJudgeType())
                .toList();
    }

    private CriteriaVarianceResponse toCriteriaVariance(
            List<Score> scores,
            double varianceThreshold
    ) {
        EventCriteria criteria = scores.get(0).getEventCriteria();
        Stats stats = calculateStats(
                scores.stream()
                .map(score -> score.getValue().doubleValue())
                .toList()
        );

        Set<UUID> judgeIds = scores.stream()
                .map(score -> score.getJudge().getId())
                .collect(Collectors.toSet());
        String category = criteria.getCriteria() == null
                || criteria.getCriteria().getCategory() == null
                ? null
                : criteria.getCriteria().getCategory().name();

        return new CriteriaVarianceResponse(
                criteria.getId(),
                criteria.getEffectiveName(),
                category,
                Boolean.TRUE.equals(criteria.getEffectiveIsTechnical()),
                stats.mean(),
                stats.variance(),
                stats.standardDeviation(),
                stats.min(),
                stats.max(),
                scores.size(),
                judgeIds.size(),
                stats.standardDeviation() >= varianceThreshold
        );
    }

    private JudgeVarianceResponse toJudgeVariance(
            List<Score> scores,
            double varianceThreshold
    ) {
        Judge judge = scores.get(0).getJudge();
        Stats stats = calculateStats(scores.stream()
                .map(score -> score.getValue().doubleValue())
                .toList());

        return new JudgeVarianceResponse(
                judge.getId(),
                hashId(judge.getId()),
                judge.getJudgeType() == null ? null : judge.getJudgeType().name(),
                stats.mean(),
                stats.variance(),
                stats.standardDeviation(),
                stats.min(),
                stats.max(),
                scores.size(),
                stats.standardDeviation() >= varianceThreshold
        );
    }

    private Stats calculateStats(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return new Stats(0d, 0d, 0d, 0d, 0d);
        }

        double mean = values.stream()
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0d);
        double variance = values.stream()
                .mapToDouble(value -> Math.pow(value - mean, 2))
                .average()
                .orElse(0d);
        double min = values.stream()
                .mapToDouble(Double::doubleValue)
                .min()
                .orElse(0d);
        double max = values.stream()
                .mapToDouble(Double::doubleValue)
                .max()
                .orElse(0d);

        return new Stats(
                round(mean),
                round(variance),
                round(Math.sqrt(variance)),
                round(min),
                round(max)
        );
    }

    private double average(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return 0d;
        }

        return values.stream()
                .filter(value -> value != null)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0d);
    }

    private double round(double value) {
        return Math.round(value * 10000d) / 10000d;
    }

    private String normalizeCriteriaType(String criteriaType) {
        String normalized = normalizeNullable(criteriaType);
        if (normalized == null) {
            return null;
        }

        String value = normalized.toUpperCase(Locale.ROOT);
        if (!Set.of("TECHNICAL", "SOFT", "PRESENTATION", "INNOVATION", "BUSINESS", "PROCESS")
                .contains(value)) {
            throw new BadRequestException(
                    "Invalid criteriaType. Use TECHNICAL, SOFT, PRESENTATION, INNOVATION, BUSINESS, or PROCESS."
            );
        }
        return value;
    }

    private boolean matchesCriteriaType(EventCriteria criteria, String criteriaTypeFilter) {
        if (criteriaTypeFilter == null) {
            return true;
        }
        if ("TECHNICAL".equals(criteriaTypeFilter)) {
            return Boolean.TRUE.equals(criteria.getEffectiveIsTechnical());
        }
        if ("SOFT".equals(criteriaTypeFilter)) {
            return !Boolean.TRUE.equals(criteria.getEffectiveIsTechnical());
        }

        return criteria.getCriteria() != null
                && criteria.getCriteria().getCategory() != null
                && criteriaTypeFilter.equals(criteria.getCriteria().getCategory().name());
    }

    private JudgeType parseJudgeType(String judgeType) {
        String normalized = normalizeNullable(judgeType);
        if (normalized == null) {
            return null;
        }

        try {
            return JudgeType.valueOf(normalized.toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid judgeType. Use INTERNAL or GUEST.");
        }
    }

    private String normalizeNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private String hashId(UUID id) {
        if (id == null) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((HASH_PREFIX + id)
                    .getBytes(StandardCharsets.UTF_8));

            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }

            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available.", ex);
        }
    }

}
