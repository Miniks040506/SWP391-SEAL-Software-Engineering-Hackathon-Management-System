package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.ExportJobStatus;
import com.t7.seal.domain.ExportType;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.dto.ExportSpec;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ExternalServiceException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.*;
import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.text.Normalizer;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.zip.ZipEntry;
import java.util.zip.ZipOutputStream;

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private static final DateTimeFormatter FILE_TIMESTAMP = DateTimeFormatter.ofPattern("yyyyMMdd_HHmmss");
    private static final int MAX_PAGE_SIZE = 100;
    private static final int EXPORT_EXPIRY_DAYS = 7;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    private final HackathonEventRepository hackathonEventRepository;
    private final RankingRepository rankingRepository;
    private final ScoreRepository scoreRepository;
    private final TeamRepository teamRepository;
    private final ExportJobRepository exportJobRepository;

    @Transactional
    @Override
    public ExportJobResponse createExportJob(
            CreateExportJobRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        ExportType exportType = parseExportType(request.exportType());
        Map<String, Object> params = normalizeParams(request.params());

        UUID eventId = parseUUID(params.get("eventId"), "eventId");
        UUID trackId = parseOptionalUUID(params.get("trackId"), "trackId");
        UUID roundId = parseOptionalUUID(params.get("roundId"), "roundId");
        String format = normalizeFormat(params.get("format"));

        EventExportRequest eventRequest = new EventExportRequest(
                trackId,
                roundId,
                format,
                parseBoolean(params.get("includeDraftScores"), false),
                parseBoolean(params.get("includeDisqualified"), false),
                parseBoolean(params.get("anonymize"), false)
        );

        return switch (exportType) {
            case RANKING -> exportEventRanking(eventId, eventRequest, authentication);
            case SCORE_REPORT -> exportEventScores(eventId, eventRequest, authentication);
            case TEAM_LIST -> exportEventTeamList(eventId, eventRequest, authentication);
            default -> throw new BadRequestException("Unsupported report type " +
                    "for generic export endpoint: " + exportType);
        };
    }

    @Transactional
    @Override
    public ExportJobResponse exportEventRanking(
            UUID eventId,
            EventExportRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        HackathonEvent event = getEvent(eventId);
        ExportSpec spec = exportSpec(event, ExportType.RANKING, request);

        List<Ranking> rankings = rankingRepository.findByEventRoundTrackWithDetails(
                eventId,
                spec.roundId(),
                spec.trackId()
        );

        List<List<String>> rows = new ArrayList<>();
        rows.add(List.of(
                "Event ID", "Event", "Round ID", "Round", "Track ID", "Track",
                "Rank", "Team ID", "Team", "Project Title", "Submission ID",
                "Total Score", "Judge Count", "Advanced", "Published", "Calculated At"
        ));

        for (Ranking ranking : rankings) {
            if (!spec.includeDisqualified()
                    && ranking.getSubmission().getStatus() == SubmissionStatus.DISQUALIFIED) {
                continue;
            }

            Team team = ranking.getSubmission().getTeam();
            Round round = ranking.getRound();
            Track track = ranking.getTrack();

            rows.add(List.of(
                    text(event.getId()),
                    text(event.getName()),
                    text(round.getId()),
                    text(round.getName()),
                    text(track.getId()),
                    text(track.getName()),
                    text(ranking.getRankPosition()),
                    text(team.getId()),
                    text(team.getName()),
                    text(team.getProjectTitle()),
                    text(ranking.getSubmission().getId()),
                    text(ranking.getTotalScore()),
                    text(ranking.getJudgeCount()),
                    text(Boolean.TRUE.equals(ranking.getIsAdvanced())),
                    text(ranking.getRound().getResultPublishedAt() != null
                            || event.getResultPublishedAt() != null),
                    text(ranking.getCalculatedAt())
            ));
        }

        return createAndProcessJob(actor, spec, rows, "ranking_report");
    }

    @Transactional
    @Override
    public ExportJobResponse exportEventScores(
            UUID eventId,
            EventExportRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        HackathonEvent event = getEvent(eventId);
        ExportSpec spec = exportSpec(event, ExportType.RANKING, request);

        List<Score> scores = scoreRepository.findForScoreExport(
                eventId,
                spec.trackId(),
                spec.roundId(),
                spec.includeDraftScores(),
                spec.includeDisqualified()
        );

        List<List<String>> rows = new ArrayList<>();
        rows.add(List.of(
                "Event ID", "Event", "Round ID", "Round", "Track ID", "Track",
                "Submission ID", "Submission Status", "Team ID", "Team",
                "Judge ID", "Judge Name", "Judge Type", "Criterion ID", "Criterion",
                "Category", "Technical", "Weight", "Max Score", "Score", "Draft", "Comment", "Scored At", "Updated At"
        ));

        for (Score score : scores) {
            Submission submission = score.getSubmission();
            Team team = submission.getTeam();
            Track track = team.getTrack();
            Round round = submission.getRound();
            Judge judge = score.getJudge();
            User judgeUser = judge.getUser();
            EventCriteria criterion = score.getEventCriteria();
            ScoringCriteria template = criterion.getCriteria();
            boolean anonymize = spec.anonymize();

            rows.add(List.of(
                    text(event.getId()),
                    text(event.getName()),
                    text(round.getId()),
                    text(round.getName()),
                    text(track == null ? null : track.getId()),
                    text(track == null ? null : track.getName()),
                    text(submission.getId()),
                    text(submission.getStatus()),
                    text(team.getId()),
                    text(team.getName()),
                    anonymize ? hashId(judge.getId()) : text(judge.getId()),
                    anonymize ? "Judge " + shortHash(judge.getId()) : text(judgeUser == null ? null : judgeUser.getFullName()),
                    text(judge.getJudgeType()),
                    text(criterion.getId()),
                    text(criterion.getEffectiveName()),
                    text(template == null ? null : template.getCategory()),
                    text(criterion.getEffectiveIsTechnical()),
                    text(criterion.getEffectiveWeight()),
                    text(criterion.getEffectiveMaxScore()),
                    text(score.getValue()),
                    text(Boolean.TRUE.equals(score.getIsDraft())),
                    text(score.getComment()),
                    text(score.getScoredAt()),
                    text(score.getUpdatedAt())
            ));
        }

        return createAndProcessJob(actor, spec, rows, "score_report");
    }

    @Transactional
    @Override
    public ExportJobResponse exportEventTeamList(
            UUID eventId,
            EventExportRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        HackathonEvent event = getEvent(eventId);
        ExportSpec spec = exportSpec(event, ExportType.RANKING, request);

        List<Team> teams = teamRepository.findForTeamListReport(
                eventId,
                spec.trackId(),
                null
        );

        List<List<String>> rows = new ArrayList<>();
        rows.add(List.of(
                "Event ID", "Event", "Track ID", "Track", "Team ID", "Team",
                "Project Title", "Status", "Member Count", "Leader ID", "Leader Name", "Leader Email", "Registered At", "Created At"
        ));

        for (Team team : teams) {
            Track track = team.getTrack();
            User leader = team.getLeader();
            rows.add(List.of(
                    text(event.getId()),
                    text(event.getName()),
                    text(track == null ? null : track.getId()),
                    text(track == null ? null : track.getName()),
                    text(team.getId()),
                    text(team.getName()),
                    text(team.getProjectTitle()),
                    text(team.getStatus()),
                    text(team.getMemberCount()),
                    text(leader == null ? null : leader.getId()),
                    text(leader == null ? null : leader.getFullName()),
                    text(leader == null ? null : leader.getEmail()),
                    text(team.getRegisteredAt()),
                    text(team.getCreatedAt())
            ));
        }

        return createAndProcessJob(actor, spec, rows, "team_list_report");
    }

    @Transactional
    @Override
    public PageResponse<ExportJobResponse> getMyExportJobs(
            String status,
            String exportType,
            int page,
            int size,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);


        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse getExportJobById(
            UUID exportId,
            Authentication authentication
    ) {
        return null;
    }

    @Transactional
    @Override
    public ExportDownloadResponse downloadExport(
            UUID exportId,
            Authentication authentication
    ) {
        return null;
    }

    @Transactional
    @Override
    public ResponseEntity<Resource> downloadExportFile(
            UUID exportId,
            Authentication authentication
    ) {
        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse retryExport(
            UUID exportId,
            Authentication authentication
    ) {
        return null;
    }

    @Transactional
    @Override
    public void deleteExport(UUID exportId, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        ExportJob exportJob = getVisibleJob(exportId, actor);

        Path file = exportJob.getFileName() == null ? null
                : exportDirectory().resolve(exportJob.getFileName()).normalize();

        exportJobRepository.delete(exportJob);

        if (file != null) {
            try {
                Files.deleteIfExists(file);
            } catch (IOException ex) {
                throw new ExternalServiceException("Failed to delete export file", ex);
            }
        }
    }

    //HELPERS

    private Path exportDirectory() {
        Path dir = Path.of(System.getProperty("java.io.tmpdir"), "seal-exports");
        try {
            Files.createDirectories(dir);
        } catch (IOException ex) {
            throw new ExternalServiceException("Failed to create export directory", ex);
        }
        return dir;
    }

    private ExportJob getVisibleJob(UUID exportId, User actor) {
        ExportJob exportJob = exportJobRepository.findById(exportId)
                .orElseThrow(() -> new BadRequestException("Export job not found: " + exportId));

        if (!actor.isAdmin() && !Objects.equals(exportJob.getRequestedBy().getId(), actor.getId())) {
            throw new ForbiddenException("You are not allowed to access this export job.");
        }

        return exportJob;
    }

    private ExportJobResponse createAndProcessJob(
            User actor,
            ExportSpec spec,
            List<List<String>> rows,
            String filePrefix
    ) {
        Map<String, Object> param = new LinkedHashMap<>();

        param.put("eventId", spec.event().getId().toString());
        if (spec.roundId() != null) {
            param.put("roundId", spec.roundId().toString());
        }
        if (spec.trackId() != null) {
            param.put("trackId", spec.trackId().toString());
        }
        param.put("format", spec.format());
        param.put("includeDraftScores", spec.includeDraftScores());
        param.put("includeDisqualified", spec.includeDisqualified());
        param.put("anonymize", spec.anonymize());

        ExportJob job = ExportJob.builder()
                .requestedBy(actor)
                .exportType(spec.type())
                .params(param)
                .status(ExportJobStatus.QUEUED)
                .build();

        job = exportJobRepository.saveAndFlush(job);

        auditLogService.record(
                actor,
                AuditActionType.EXPORT_REQUESTED,
                "export_jobs",
                job.getId(),
                null,
                Map.of(
                        "exportType", spec.type().name(),
                        "eventId", spec.event().getId().toString(),
                        "roundId", spec.roundId() == null ? " " : spec.roundId().toString(),
                        "trackId", spec.trackId() == null ? " " : spec.trackId().toString(),
                        "format", spec.format()
                ),
                null
        );

        try {
            job.markProcessing();
            exportJobRepository.saveAndFlush(job);

            String extension = spec.format().equals("XLSX") ? "xlsx" : "csv";
            String fileName = buildFileName(filePrefix, spec.event(), job.getId(), extension);
            Path file = exportDirectory().resolve(fileName);

            byte[] data = spec.format().equals("XLSX")
                    ? writeXlsx(rows)
                    : writeCsv(rows).getBytes(StandardCharsets.UTF_8);
            Files.write(file, data);

        } catch (IOException ex) {
            throw new ExternalServiceException("Failed to create export file", ex);
        }

        return null;
    }

    private byte[] writeXlsx(List<List<String>> rows) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try (ZipOutputStream zip = new ZipOutputStream(output, StandardCharsets.UTF_8)) {
            put(zip, "[Content_Types].xml", null);
            put(zip, "_rels/.rels", null);
            put(zip, "xl/workbook.xml", null);
            put(zip, "xl/_rels/workbook.xml.rels", null);
            put(zip, "xl/worksheets/sheet1.xml", null);
            put(zip, "xl/styles.xml", null);
        }
        return output.toByteArray();
    }

    private String writeCsv(List<List<String>> rows) {
        StringBuilder builder = new StringBuilder();
        for (List<String> row : rows) {
            for (int i = 0; i < row.size(); i++) {
                if (i > 0) {
                    builder.append(',');
                }
                builder.append(csvEscape(row.get(i)));
            }
            builder.append('\n');
        }
        return builder.toString();
    }

    private String csvEscape(String value) {
        String safe = (value == null) ? "" : value;
        if (safe.contains(",") || safe.contains("\n") || safe.contains("\r") || safe.contains("\"")) {
            return "\"" + safe.replace("\"", "\"\"") + "\"";
        }
        return safe;
    }

    private void put(ZipOutputStream zip, String name, String content) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(content.stripLeading().getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private String buildFileName(
            String prefix,
            HackathonEvent event,
            UUID jobId,
            String extension
    ) {
        return "%s_%s_%s_%s.%s".formatted(
                prefix,
                slug(event.getName()),
                LocalDateTime.now().format(FILE_TIMESTAMP),
                jobId.toString().substring(0, 8),
                extension
        );
    }

    private String slug(String value) {
        String normalized = Normalizer
                .normalize(value == null ? "event" : value, Normalizer.Form.NFD)
                .replaceAll("\\p{M}", "")
                .toLowerCase(Locale.ROOT)
                .replaceAll("[^a-z0-9]+", "-")
                .replaceAll("(^-|-$)", "");

        return normalized.isBlank() ? "event" : normalized;
    }

    private String text(Object value) {
        return value == null ? "" : value.toString();
    }

    private String hashId(UUID id) {
        return id == null ? "" : Integer.toHexString(id.toString().hashCode());
    }

    private String shortHash(UUID id) {
        String hash = hashId(id);
        return hash.length() <= 6 ? hash : hash.substring(0, 6);
    }

    private ExportSpec exportSpec(HackathonEvent event, ExportType type, EventExportRequest request) {
        String format = normalizeFormat(request == null ? null : request.format());
        return new ExportSpec(
                event,
                type,
                request == null ? null : request.roundId(),
                request == null ? null : request.trackId(),
                format,
                Boolean.TRUE.equals(request == null ? null : request.includeDraftScores()),
                Boolean.TRUE.equals(request == null ? null : request.includeDisqualified()),
                Boolean.TRUE.equals(request == null ? null : request.anonymize())
        );
    }

    private HackathonEvent getEvent(UUID eventId) {
        if (eventId == null) {
            throw new BadRequestException("Event id is required");
        }

        return hackathonEventRepository.findById(eventId)
                .orElseThrow(() -> new BadRequestException("Event not found"));
    }

    private boolean parseBoolean(Object value, boolean defaultValue) {
        if (value == null) {
            return defaultValue;
        }
        if (value instanceof Boolean bool) {
            return bool;
        }
        return Boolean.parseBoolean(value.toString());
    }

    private UUID parseUUID(Object value, String fieldName) {
        UUID parse = parseOptionalUUID(value, fieldName);
        if (parse == null) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
        return parse;
    }

    private UUID parseOptionalUUID(Object value, String fieldName) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            return UUID.fromString(value.toString());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
    }

    private void ensureCanExport(User user) {
        if (user == null || (!user.isAdmin() && !user.isCoordinator())) {
            throw new ForbiddenException("Only admin or coordinator can exports.");
        }
    }

    private ExportType parseExportType(String value) {
        if (value == null || value.isBlank()) {
            throw new BadRequestException("Export type is required");
        }
        String normalized = value.trim().toUpperCase().replace("-", "_");
        if (normalized.equals("SCORES")
                || normalized.equals("SCORE")
                || normalized.equals("SCORE_REPORTS")
        ) {
            normalized = "SCORE_REPORT";
        }

        try {
            return ExportType.valueOf(normalized);
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid export type: " + value);
        }
    }

    private String normalizeFormat(Object value) {
        if (value == null || value.toString().isBlank()) {
            return "CSV";
        }
        String format = value.toString().trim().toUpperCase();
        if (!format.equals("CSV") && !format.equals("XLSX")) {
            throw new BadRequestException("Invalid export format: " + value);
        }
        return format;
    }

    private Map<String, Object> normalizeParams(Object param) {
        if (param == null) {
            throw new BadRequestException("Export params are required");
        }

        Map<String, Object> map = objectMapper
                .convertValue(param, new TypeReference<Map<String, Object>>() {
                });

        if (map == null || map.isEmpty()) {
            throw new BadRequestException("Export params are required");
        }

        return new LinkedHashMap<>(map);
    }
}
