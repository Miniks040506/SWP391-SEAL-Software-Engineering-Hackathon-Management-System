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
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
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

    @Transactional(readOnly = true)
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

        ExportJobStatus parsedStatus = parseExportJobStatus(status);
        ExportType parsedType = parseOptionalExportType(exportType);

        int safePage = Math.max(page, 0);
        int safeSize = Math.min(Math.max(size, 1), MAX_PAGE_SIZE);

        Specification<ExportJob> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();
            if (!actor.isAdmin()) {
                predicates.add(cb.equal(root.get("requestedBy").get("id"), actor.getId()));
            }
            if (parsedStatus != null) {
                predicates.add(cb.equal(root.get("status"), parsedStatus));
            }
            if (parsedType != null) {
                predicates.add(cb.equal(root.get("exportType"), parsedType));
            }
            return cb.and(predicates.toArray(new Predicate[0]));
        };

        Page<ExportJob> result = exportJobRepository.findAll(
                spec,
                PageRequest.of(safePage, safeSize, Sort.by(Sort.Direction.DESC, "requestedAt"))
        );

        return new PageResponse<>(
                result.getContent().stream()
                        .map(this::toResponse)
                        .toList(),
                result.getNumber(),
                result.getSize(),
                result.getTotalElements(),
                result.getTotalPages(),
                result.isLast()
        );
    }

    @Transactional(readOnly = true)
    @Override
    public ExportJobResponse getExportJobById(
            UUID exportId,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);
        
        ExportJob job = getVisibleJob(exportId, actor);

        return toResponse(job);
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


            job.markDone(
                    "/api/v1/exports/" + job.getId() + "/download-file",
                    fileName,
                    Files.size(file),
                    Math.max(rows.size() - 1, 0),
                    LocalDateTime.now().plusDays(EXPORT_EXPIRY_DAYS)
            );
            ExportJob saved = exportJobRepository.save(job);

            auditLogService.record(
                    actor,
                    AuditActionType.EXPORT_COMPLETED,
                    "export_jobs",
                    saved.getId(),
                    null,
                    Map.of(
                            "exportType", spec.type().name(),
                            "rowCount", String.valueOf(saved.getRowCount()),
                            "fileName", saved.getFileName(),
                            "eventId", spec.event().getId().toString()
                    ),
                    null
            );

            return toResponse(saved);
        } catch (IOException ex) {
            job.markFailed(ex.getMessage());
            ExportJob failed = exportJobRepository.save(job);

            auditLogService.record(
                    actor,
                    AuditActionType.EXPORT_FAILED,
                    "export_jobs",
                    failed.getId(),
                    null,
                    Map.of(
                            "error", ex.getMessage(),
                            "eventId", spec.event().getId().toString()
                    ),
                    null
            );

            return toResponse(failed);
        }
    }

    private ExportJobResponse toResponse(ExportJob job) {
        User requestedBy = job.getRequestedBy();

        return new ExportJobResponse(
                job.getId(),
                requestedBy == null ? null : requestedBy.getId(),
                job.getExportType() == null ? null : job.getExportType().name(),
                job.getParams(),
                job.getStatus() == null ? null : job.getStatus().name(),
                job.getFileName(),
                job.getFileSizeBytes(),
                job.getRowCount(),
                job.getErrorMessage(),
                job.getRequestedAt(),
                job.getCompletedAt(),
                job.getExpiresAt()
        );
    }

    private byte[] writeXlsx(List<List<String>> rows) throws IOException {
        ByteArrayOutputStream output = new ByteArrayOutputStream();

        try (ZipOutputStream zip = new ZipOutputStream(output, StandardCharsets.UTF_8)) {
            put(zip, "[Content_Types].xml", contentTypesXml());
            put(zip, "_rels/.rels", rootRelsXml());
            put(zip, "xl/workbook.xml", workbookXml());
            put(zip, "xl/_rels/workbook.xml.rels", workbookRelsXml());
            put(zip, "xl/worksheets/sheet1.xml", worksheetXml(rows));
            put(zip, "xl/styles.xml", stylesXml());

        }
        return output.toByteArray();
    }

    private void put(ZipOutputStream zip, String name, String content) throws IOException {
        zip.putNextEntry(new ZipEntry(name));
        zip.write(content.stripLeading().getBytes(StandardCharsets.UTF_8));
        zip.closeEntry();
    }

    private String contentTypesXml() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
                  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
                  <Default Extension="xml" ContentType="application/xml"/>
                  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
                  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
                  <Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>
                </Types>
                """;
    }

    private String rootRelsXml() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
                </Relationships>
                """;
    }

    private String workbookXml() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
                  <sheets><sheet name="Report" sheetId="1" r:id="rId1"/></sheets>
                </workbook>
                """;
    }

    private String workbookRelsXml() {
        return """
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
                  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
                  <Relationship Id="rId2" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/styles" Target="styles.xml"/>
                </Relationships>
                """;
    }

    private String stylesXml() {
        return """
                                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                                <styleSheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                                  <fonts count="1"><font><sz val="11"/><name val="Calibri"/></font></fonts>
                                  <fills count="1"><fill><patternFill patternType="none"/></fill></fills>
                                  <borders count="1"><border/></borders>
                                  <cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>
                <cellXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/></cellXfs>
                                </styleSheet>
                """;
    }

    private String worksheetXml(List<List<String>> rows) {
        StringBuilder builder = new StringBuilder("""
                <?xml version="1.0" encoding="UTF-8" standalone="yes"?>
                <worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
                  <sheetData>
                """);
        for (int r = 0; r < rows.size(); r++) {
            builder.append("<row r=\"").append(r + 1).append("\">");
            List<String> row = rows.get(r);
            for (int c = 0; c < row.size(); c++) {
                builder.append("<c r=\"")
                        .append(cellRef(c, r + 1))
                        .append("\" t=\"inlineStr\"><is><t>")
                        .append(xmlEscape(row.get(c)))
                        .append("</t></is></c>");
            }
            builder.append("</row>");
        }
        builder.append("</sheetData></worksheet>");
        return builder.toString();
    }

    private String cellRef(int columnIndex, int rowIndex) {
        StringBuilder col = new StringBuilder();
        int c = columnIndex;
        do {
            col.insert(0, (char) ('A' + (c % 26)));
            c = c / 26 - 1;
        } while (c >= 0);
        return col + String.valueOf(rowIndex);
    }

    private String xmlEscape(String value) {
        return (value == null ? "" : value)
                .replace("&", "&amp;")
                .replace("<", "&lt;")
                .replace(">", "&gt;")
                .replace("\"", "&quot;")
                .replace("'", "&apos;");
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

    private ExportType parseOptionalExportType(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return parseExportType(value);
    }

    private ExportJobStatus parseExportJobStatus(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }

        try {
            return ExportJobStatus.valueOf(value.trim().toUpperCase());
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid export job status: " + value);
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
