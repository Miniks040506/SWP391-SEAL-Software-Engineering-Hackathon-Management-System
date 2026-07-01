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

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@Service
@RequiredArgsConstructor
public class RblResearchServiceImpl implements RblResearchService {

    private static final double HIGH_VARIANCE_THRESHOLD = 2.0d;
    private static final String HASH_PREFIX = "SEAL-RBL-v1:";

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;

    private final HackathonEventRepository hackathonEventRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final ScoreRepository scoreRepository;
    private final ExportJobRepository exportJobRepository;

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

        try {
            job.markProcessing();
            exportJobRepository.saveAndFlush(job);

            String csv = buildRblCsv(scores);
            String fileName = buildFileName(event, job.getId(), normalizedFormat);
            Path exportPath = writeExportFile(fileName, csv);
            String downloadUrl = "/api/v1/exports/" + job.getId() + "/download-file";

            job.markDone(
                    downloadUrl,
                    fileName,
                    Files.size(exportPath),
                    scores.size(),
                    LocalDateTime.now().plusDays(7)
            );
            ExportJob saved = exportJobRepository.save(job);

            auditLogService.record(
                    actor,
                    AuditActionType.EXPORT_COMPLETED,
                    "export_jobs",
                    saved.getId(),
                    null,
                    compactMap("status", saved.getStatus().name(), "rowCount", saved.getRowCount()),
                    compactMap("eventId", eventId, "roundId", roundId, "trackId", trackId, "fileName", fileName)
            );

            return toExportJobResponse(saved);
        } catch (IOException | RuntimeException e) {
            throw new RuntimeException(e);
        }
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

    private String buildRblCsv(List<Score> scores) {
        StringBuilder sb = new StringBuilder();
        sb.append("hashedJudgeId,judgeType,hashedTrackId,hashedRoundId,eventCriteriaId,criteriaName,criterionCategory,criterionType,hashedSubmissionId,rawScore,scoreDateBucket\n");

        for (Score score : scores) {
            EventCriteria criteria = score.getEventCriteria();
            Submission submission = score.getSubmission();
            Team team = submission.getTeam();
            Track track = team == null ? null : team.getTrack();
            Round round = submission.getRound();
            String category = criteria.getCriteria() == null || criteria.getCriteria().getCategory() == null
                    ? ""
                    : criteria.getCriteria().getCategory().name();
            String criterionType = Boolean.TRUE.equals(criteria.getEffectiveIsTechnical()) ? "TECHNICAL" : "SOFT";
            String scoreDateBucket = score.getScoredAt() == null
                    ? ""
                    : score.getScoredAt().toLocalDate().format(DateTimeFormatter.ISO_LOCAL_DATE);

            sb.append(csv(hashId(score.getJudge().getId()))).append(',')
                    .append(csv(score.getJudge().getJudgeType() == null ? null : score.getJudge().getJudgeType().name())).append(',')
                    .append(csv(track == null ? null : hashId(track.getId()))).append(',')
                    .append(csv(round == null ? null : hashId(round.getId()))).append(',')
                    .append(csv(criteria.getId() == null ? null : criteria.getId().toString())).append(',')
                    .append(csv(criteria.getEffectiveName())).append(',')
                    .append(csv(category)).append(',')
                    .append(csv(criterionType)).append(',')
                    .append(csv(submission.getId() == null ? null : hashId(submission.getId()))).append(',')
                    .append(score.getValue()).append(',')
                    .append(csv(scoreDateBucket))
                    .append('\n');
        }
        return sb.toString();
    }

    private String buildFileName(HackathonEvent event, UUID exportId, String format) {
        String safeName = event.getSlug() == null || event.getSlug().isBlank()
                ? event.getName().replaceAll("[^A-Za-z0-9]+", "-").toLowerCase(Locale.ROOT)
                : event.getSlug();
        return "seal-rbl-" + safeName + "-" + exportId + "." + format;
    }

    private Path writeExportFile(String fileName, String content) throws IOException {
        Path dir = Path.of(System.getProperty("java.io.tmpdir"), "seal-exports");
        Files.createDirectories(dir);
        Path path = dir.resolve(fileName);
        Files.writeString(path, content, StandardCharsets.UTF_8);
        return path;
    }

    private String csv(String value) {
        if (value == null) {
            return "";
        }
        String escaped = value.replace("\"", "\"\"");
        if (escaped.contains(",") || escaped.contains("\n") || escaped.contains("\r") || escaped.contains("\"")) {
            return "\"" + escaped + "\"";
        }
        return escaped;
    }

    private String hashId(UUID id) {
        if (id == null) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((HASH_PREFIX + id).getBytes(StandardCharsets.UTF_8));
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available.", ex);
        }
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
