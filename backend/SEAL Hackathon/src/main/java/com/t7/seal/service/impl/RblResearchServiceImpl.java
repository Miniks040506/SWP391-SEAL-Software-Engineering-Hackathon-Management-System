package com.t7.seal.service.impl;

import com.t7.seal.domain.*;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.*;
import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.RblResearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RblResearchServiceImpl implements RblResearchService {

    private final CurrentUserService currentUserService;

    private final HackathonEventRepository hackathonEventRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final ScoreRepository scoreRepository;
    private final ExportJobRepository exportJobRepository;

    private final AuditLogService auditLogService;

    @Override
    public VarianceDashboardResponse getVarianceDashboard(UUID eventId, UUID roundId, UUID trackId, String criteriaType, String judgeType, Authentication authentication) {
        return null;
    }

    @Override
    public ExportJobResponse exportAnonymizedDataset(
            UUID eventId,
            ExportRblDatasetRequest request,
            Authentication authentication
    ) {
        User actor = ensureCoordinatorOrAdmin(authentication);
        HackathonEvent event = requireEvent(eventId);

        UUID roundId = (request == null) ? null : request.roundId();
        UUID trackId = (request == null) ? null : request.trackId();
        String format = (request == null) ? null : request.format();

        validateRoundBelongsToEvent(roundId, eventId);
        validateTrackBelongsToEvent(trackId, eventId);
        String normalizedFormat = normalizeFormat(format);

        List<Score> scores = loadFilteredScores(eventId, roundId, trackId, null, null);

        Map<String, Object> params = new LinkedHashMap<>();
        params.put("eventId", eventId.toString());
        if (roundId != null) {
            params.put("roundId", roundId.toString());
        }
        if (trackId != null) {
            params.put("trackId", trackId.toString());
        }
        params.put("format", normalizedFormat);
        params.put("anonymize", true);
        params.put("dataset", "RBL_SCORE_DATASET");

        ExportJob job = ExportJob.builder()
                .requestedBy(actor)
                .exportType(ExportType.SCORE_DATASET_ANONYMIZED)
                .params(params)
                .status(ExportJobStatus.QUEUED)
                .build();
        job = exportJobRepository.saveAndFlush(job);

        auditLogService.record(
                actor,
                AuditActionType.EXPORT_REQUESTED,
                "export_jobs",
                job.getId(),
                null,
                compactMap("status", job.getStatus().name(), "exportType", job.getExportType().name()),
                compactMap("eventId", eventId, "roundId", roundId, "trackId", trackId, "format", normalizedFormat)
        );


        return null;
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
            Boolean technicalFilter,
            JudgeType judgeTypeFilter
    ) {
        return scoreRepository.findConfirmedScoresForRblDashboard(eventId, roundId, trackId)
                .stream()
                .filter(score -> score == null || technicalFilter
                        .equals(Boolean.TRUE.equals(score.getEventCriteria().getEffectiveIsTechnical())))
                .filter(score -> judgeTypeFilter == null
                        || judgeTypeFilter == score.getJudge().getJudgeType())
                .toList();
    }



    private String normalizeFormat(String format) {
        String normalized = normalizeNullable(format);
        if (normalized == null) {
            return "csv";
        }
        if (!"csv".equalsIgnoreCase(normalized)) {
            throw new BadRequestException("RBL dataset export currently supports csv only.");
        }
        return "csv";
    }

    private String normalizeNullable(String value) {
        return value == null || value.isBlank() ? null : value.trim();
    }

    private Map<String, Object> compactMap(Object... keyValues) {
        Map<String, Object> result = new LinkedHashMap<>();
        if (keyValues == null) {
            return result;
        }
        for (int i = 0; i + 1 < keyValues.length; i += 2) {
            Object key = keyValues[i];
            Object value = keyValues[i + 1];
            if (key != null && value != null) {
                result.put(String.valueOf(key), value);
            }
        }
        return result;
    }
}
