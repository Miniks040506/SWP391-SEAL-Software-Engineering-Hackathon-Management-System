package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.ExportJobStatus;
import com.t7.seal.domain.ExportType;
import com.t7.seal.domain.HackathonSeason;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.domain.UserStatus;
import com.t7.seal.dto.ExportSpec;
import com.t7.seal.entities.*;
import com.t7.seal.exception.*;
import com.t7.seal.repository.*;
import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.ExportService;
import jakarta.persistence.criteria.Predicate;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.FileSystemResource;
import org.springframework.core.io.Resource;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
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
    private static final String RBL_HASH_PREFIX = "SEAL-RBL-v1:";
    private static final int MAX_PAGE_SIZE = 100;
    private static final int EXPORT_EXPIRY_DAYS = 7;

    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;

    private final HackathonEventRepository hackathonEventRepository;
    private final RankingRepository rankingRepository;
    private final ScoreRepository scoreRepository;
    private final TeamRepository teamRepository;
    private final RoundRepository roundRepository;
    private final TrackRepository trackRepository;
    private final ExportJobRepository exportJobRepository;
    private final CalibrationRoundRepository calibrationRoundRepository;
    private final AuditLogRepository auditLogRepository;
    private final UserRepository userRepository;

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

        String format = normalizeFormat(params.get("format"));

        if (exportType == ExportType.ADMIN_ANNUAL_REPORT) {
            return exportAdminAnnualReport(
                    parseOptionalInteger(params.get("year"), "year"),
                    parseOptionalSeason(params.get("season")),
                    format,
                    authentication
            );
        }

        UUID eventId = parseUUID(params.get("eventId"), "eventId");
        UUID trackId = parseOptionalUUID(params.get("trackId"), "trackId");
        UUID roundId = parseOptionalUUID(params.get("roundId"), "roundId");

        EventExportRequest eventRequest = new EventExportRequest(
                roundId,
                trackId,
                format,
                parseBoolean(params.get("includeDraftScores"), false),
                parseBoolean(params.get("includeDisqualified"), false),
                parseBoolean(params.get("anonymize"), false)
        );

        return switch (exportType) {
            case RANKING -> exportEventRanking(eventId, eventRequest, authentication);
            case SCORE_REPORT -> exportEventScores(eventId, eventRequest, authentication);
            case TEAM_LIST -> exportEventTeamList(eventId, eventRequest, authentication);
            case CALIBRATION_REPORT -> exportCalibrationReport(eventId, eventRequest, authentication);
            case FULL_EVENT_REPORT -> exportFullEventReport(eventId, eventRequest, authentication);
            case SCORE_DATASET_ANONYMIZED -> exportEventRblDataset(
                    eventId,
                    new ExportRblDatasetRequest(roundId, trackId, format),
                    authentication
            );
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
                "Rank", "Team ID", "Team", "Leader Name", "Project Title", "Submission ID",
                "Submission Status", "Total Score", "Judge Count", "Advance Reason",
                "Advanced", "Published", "Calculated At"
        ));

        for (Ranking ranking : rankings) {
            Submission submission = ranking.getSubmission();
            if (!spec.includeDisqualified()
                    && submission.getStatus() == SubmissionStatus.DISQUALIFIED) {
                continue;
            }

            Team team = submission.getTeam();
            User leader = team.getLeader();
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
                    text(leader == null ? null : leader.getFullName()),
                    text(team.getProjectTitle()),
                    text(submission.getId()),
                    text(submission.getStatus()),
                    text(ranking.getTotalScore()),
                    text(ranking.getJudgeCount()),
                    text(ranking.getAdvanceReason()),
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
        ExportSpec spec = exportSpec(event, ExportType.SCORE_REPORT, request);

        List<Score> scores = scoreRepository.findForScoreExport(
                eventId,
                spec.roundId(),
                spec.trackId(),
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
        ExportSpec spec = exportSpec(event, ExportType.TEAM_LIST, request);

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
    public ExportJobResponse exportEventRblDataset(
            UUID eventId,
            ExportRblDatasetRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        HackathonEvent event = getEvent(eventId);
        UUID roundId = request == null ? null : request.roundId();
        UUID trackId = request == null ? null : request.trackId();
        String format = normalizeFormat(request == null ? null : request.format());

        validateRoundBelongsToEvent(roundId, eventId);
        validateTrackBelongsToEvent(trackId, eventId);

        ExportSpec spec = new ExportSpec(
                event,
                ExportType.SCORE_DATASET_ANONYMIZED,
                roundId,
                trackId,
                format,
                false,
                false,
                true
        );

        List<Score> scores = scoreRepository.findConfirmedScoresForRblDashboard(
                eventId,
                roundId,
                trackId
        );

        return createAndProcessJob(
                actor,
                spec,
                buildRblDatasetRows(scores),
                "rbl_dataset"
        );
    }

    private ExportJobResponse exportCalibrationReport(
            UUID eventId,
            EventExportRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        HackathonEvent event = getEvent(eventId);
        ExportSpec spec = exportSpec(event, ExportType.CALIBRATION_REPORT, request);

        return createAndProcessJob(
                actor,
                spec,
                buildCalibrationReportRows(event),
                "calibration_report"
        );
    }

    private ExportJobResponse exportFullEventReport(
            UUID eventId,
            EventExportRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        HackathonEvent event = getEvent(eventId);
        ExportSpec spec = exportSpec(event, ExportType.FULL_EVENT_REPORT, request);

        return createAndProcessJob(
                actor,
                spec,
                buildFullEventReportRows(event, spec),
                "full_event_report"
        );
    }

    private ExportJobResponse exportAdminAnnualReport(
            Integer year,
            HackathonSeason season,
            String format,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureAdminCanExportSystemReports(actor);

        List<HackathonEvent> scopedEvents = hackathonEventRepository.findAll()
                .stream()
                .filter(event -> year == null || Objects.equals(event.getYear(), year))
                .filter(event -> season == null || event.getSeason() == season)
                .sorted(Comparator
                        .comparing(HackathonEvent::getYear, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(HackathonEvent::getSeason, Comparator.nullsLast(Comparator.naturalOrder()))
                        .thenComparing(HackathonEvent::getName, Comparator.nullsLast(String::compareToIgnoreCase)))
                .toList();

        ExportSpec spec = new ExportSpec(
                null,
                ExportType.ADMIN_ANNUAL_REPORT,
                null,
                null,
                format,
                false,
                true,
                false
        );

        Map<String, Object> extraParams = new LinkedHashMap<>();
        if (year != null) {
            extraParams.put("year", year);
        }
        if (season != null) {
            extraParams.put("season", season.name());
        }
        extraParams.put("scope", "SYSTEM");

        return createAndProcessJob(
                actor,
                spec,
                buildAdminAnnualReportRows(year, season, scopedEvents),
                "admin_annual_report",
                extraParams
        );
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
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        ExportJob job = getVisibleJob(exportId, actor);
        ensureDownloadable(job);

        return new ExportDownloadResponse(
                job.getId(),
                job.getFileName(),
                job.getFileUrl(),
                job.getExpiresAt()
        );
    }

    @Transactional
    @Override
    public ResponseEntity<Resource> downloadExportFile(
            UUID exportId,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        ExportJob job = getVisibleJob(exportId, actor);
        ensureDownloadable(job);

        Path file = exportDirectory().resolve(job.getFileName()).normalize();
        if (!Files.exists(file) || !Files.isRegularFile(file)) {
            throw new NotFoundException("Export file was not found on the server: " + exportId);
        }

        Resource resource = new FileSystemResource(file.toFile());
        String contentType = job.getFileName().endsWith(".xlsx")
                ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
                : "text/csv";

        return ResponseEntity.ok()
                .header(HttpHeaders.CONTENT_DISPOSITION,
                        ContentDisposition.attachment().filename(job.getFileName()).build().toString())
                .contentType(MediaType.parseMediaType(contentType))
                .body(resource);
    }

    @Transactional
    @Override
    public ExportJobResponse retryExport(
            UUID exportId,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        ExportJob existing = getVisibleJob(exportId, actor);
        if (existing.getStatus().equals(ExportJobStatus.PROCESSING)) {
            throw new ConflictException("Export job is already being processed");
        }

        Map<String, Object> params = existing.getParams();
        if (existing.getExportType() == ExportType.ADMIN_ANNUAL_REPORT) {
            return exportAdminAnnualReport(
                    parseOptionalInteger(params.get("year"), "year"),
                    parseOptionalSeason(params.get("season")),
                    normalizeFormat(params.get("format")),
                    authentication
            );
        }

        UUID eventId = parseUUID(params.get("eventId"), "eventId");
        EventExportRequest request = eventExportRequestFromParams(params);

        //create a fresh job instead of mutating the old completed/failed one.
        //this keep audit history append only
        return switch (existing.getExportType()) {
            case RANKING -> exportEventRanking(eventId, request, authentication);
            case SCORE_REPORT -> exportEventScores(eventId, request, authentication);
            case TEAM_LIST -> exportEventTeamList(eventId, request, authentication);
            case CALIBRATION_REPORT -> exportCalibrationReport(eventId, request, authentication);
            case FULL_EVENT_REPORT -> exportFullEventReport(eventId, request, authentication);
            case SCORE_DATASET_ANONYMIZED -> exportEventRblDataset(
                    eventId,
                    new ExportRblDatasetRequest(
                            request.roundId(),
                            request.trackId(),
                            request.format()
                    ),
                    authentication
            );
            default -> throw new BadRequestException("Unsupported report type " +
                    "for generic export endpoint: " + existing.getExportType());
        };
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

    private List<List<String>> buildFullEventReportRows(HackathonEvent event, ExportSpec spec) {
        List<Round> rounds = roundRepository.findByEventIdOrderByOrderIndexAsc(event.getId());
        List<Track> tracks = trackRepository.findByEventIdOrderByNameAsc(event.getId());
        List<Team> teams = teamRepository.findForTeamListReport(event.getId(), spec.trackId(), null);
        List<Ranking> rankings = rankingRepository.findByEventRoundTrackWithDetails(
                event.getId(),
                spec.roundId(),
                spec.trackId()
        );
        List<Score> scores = scoreRepository.findForScoreExport(
                event.getId(),
                spec.roundId(),
                spec.trackId(),
                true,
                true
        );
        List<CalibrationRound> calibrationRounds = calibrationRoundRepository
                .findByEventIdOrderByStartAtAsc(event.getId());

        long confirmedScores = scores.stream().filter(Score::isConfirmed).count();
        long draftScores = scores.size() - confirmedScores;
        List<Score> reliabilityScores = scoreRepository.findConfirmedScoresForRblDashboard(
                event.getId(),
                spec.roundId(),
                spec.trackId()
        );

        List<List<String>> rows = new ArrayList<>();
        rows.add(row("Section", "Metric", "Value", "Details"));
        rows.add(row("Event", "Event ID", event.getId(), ""));
        rows.add(row("Event", "Name", event.getName(), ""));
        rows.add(row("Event", "Season", event.getSeason(), "Year: " + text(event.getYear())));
        rows.add(row("Event", "Status", event.getStatus(), ""));
        rows.add(row("Event", "Registration Window",
                text(event.getRegistrationOpen()) + " to " + text(event.getRegistrationClose()), ""));
        rows.add(row("Scope", "Round Filter", spec.roundId(), "Blank means all rounds"));
        rows.add(row("Scope", "Track Filter", spec.trackId(), "Blank means all tracks"));
        rows.add(row("Summary", "Track Count", tracks.size(), ""));
        rows.add(row("Summary", "Round Count", rounds.size(), ""));
        rows.add(row("Summary", "Team Count", teams.size(), ""));
        rows.add(row("Summary", "Ranking Rows", rankings.size(), ""));
        rows.add(row("Summary", "Confirmed Scores", confirmedScores, ""));
        rows.add(row("Summary", "Draft Scores", draftScores, ""));
        rows.add(row("Summary", "Calibration Rounds", calibrationRounds.size(), ""));
        rows.add(row("Reliability", "ICC One-Way Estimate",
                formatNullable(calculateIccOneWay(reliabilityScores)),
                "Confirmed non-disqualified official scores"));
        rows.add(row("", "", "", ""));

        rows.add(row("Round", "Name", "Status", "Deadline / Publish State"));
        for (Round round : rounds) {
            rows.add(row(
                    "Round",
                    round.getName(),
                    round.getStatus(),
                    "submission=" + text(round.getSubmissionDeadline())
                            + "; judging=" + text(round.getJudgingDeadline())
                            + "; resultPublishedAt=" + text(round.getResultPublishedAt())
            ));
        }
        rows.add(row("", "", "", ""));

        rows.add(row("Track", "Name", "Team Limits", "Required Links"));
        for (Track track : tracks) {
            rows.add(row(
                    "Track",
                    track.getName(),
                    text(track.getMinMembers()) + "-" + text(track.getMaxMembers())
                            + "; maxTeams=" + text(track.getMaxTeams()),
                    track.getRequiredLinkTypes()
            ));
        }
        rows.add(row("", "", "", ""));

        rows.add(row("Team", "Name", "Status", "Leader / Members"));
        for (Team team : teams) {
            rows.add(row(
                    "Team",
                    team.getName(),
                    team.getStatus(),
                    "leader=" + text(team.getLeader() == null ? null : team.getLeader().getFullName())
                            + "; members=" + text(team.getMemberCount())
                            + "; track=" + text(team.getTrack() == null ? null : team.getTrack().getName())
            ));
        }
        rows.add(row("", "", "", ""));

        rows.add(row("Ranking", "Round / Track / Rank", "Team", "Score / Advanced"));
        for (Ranking ranking : rankings) {
            Team team = ranking.getSubmission().getTeam();
            rows.add(row(
                    "Ranking",
                    text(ranking.getRound().getName()) + " / "
                            + text(ranking.getTrack().getName()) + " / #"
                            + text(ranking.getRankPosition()),
                    team == null ? null : team.getName(),
                    "score=" + text(ranking.getTotalScore())
                            + "; advanced=" + text(ranking.getIsAdvanced())
                            + "; reason=" + text(ranking.getAdvanceReason())
            ));
        }

        return rows;
    }

    private List<List<String>> buildCalibrationReportRows(HackathonEvent event) {
        List<CalibrationRound> calibrationRounds = calibrationRoundRepository
                .findByEventIdOrderByStartAtAsc(event.getId());

        List<List<String>> rows = new ArrayList<>();
        rows.add(row(
                "Calibration ID",
                "Event",
                "Description",
                "Start",
                "End",
                "Mandatory",
                "Distribution Published At",
                "Sample Submission ID",
                "Benchmark Criteria Count",
                "Score Count",
                "Judge Count",
                "Average Absolute Benchmark Deviation"
        ));

        for (CalibrationRound calibrationRound : calibrationRounds) {
            List<CalibrationScore> scores = calibrationRound.getCalibrationScores() == null
                    ? List.of()
                    : calibrationRound.getCalibrationScores();
            long judgeCount = scores.stream()
                    .map(score -> score.getJudge().getId())
                    .distinct()
                    .count();
            Double averageDeviation = average(scores.stream()
                    .map(CalibrationScore::getAbsoluteDeviation)
                    .filter(Objects::nonNull)
                    .map(Float::doubleValue)
                    .toList());

            rows.add(row(
                    calibrationRound.getId(),
                    event.getName(),
                    calibrationRound.getDescription(),
                    calibrationRound.getStartAt(),
                    calibrationRound.getEndAt(),
                    calibrationRound.getIsMandatory(),
                    calibrationRound.getDistributionPublishedAt(),
                    calibrationRound.getSampleSubmission() == null
                            ? null
                            : calibrationRound.getSampleSubmission().getId(),
                    calibrationRound.getBenchmarkScores() == null
                            ? 0
                            : calibrationRound.getBenchmarkScores().size(),
                    scores.size(),
                    judgeCount,
                    formatNullable(averageDeviation)
            ));
        }

        return rows;
    }

    private List<List<String>> buildAdminAnnualReportRows(
            Integer year,
            HackathonSeason season,
            List<HackathonEvent> events
    ) {
        Set<UUID> eventIds = events.stream()
                .map(HackathonEvent::getId)
                .collect(java.util.stream.Collectors.toCollection(LinkedHashSet::new));
        boolean eventScoped = year != null || season != null;

        List<Score> confirmedScores = new ArrayList<>();
        List<Team> teams = new ArrayList<>();
        List<Ranking> rankings = new ArrayList<>();
        for (HackathonEvent event : events) {
            confirmedScores.addAll(scoreRepository.findConfirmedScoresForRblDashboard(
                    event.getId(),
                    null,
                    null
            ));
            teams.addAll(teamRepository.findForTeamListReport(event.getId(), null, null));
            rankings.addAll(rankingRepository.findByEventRoundTrackWithDetails(
                    event.getId(),
                    null,
                    null
            ));
        }

        List<AuditLog> scopedAuditLogs = auditLogRepository
                .findAll(Sort.by(Sort.Direction.DESC, "createdAt"))
                .stream()
                .filter(log -> year == null || (log.getCreatedAt() != null && log.getCreatedAt().getYear() == year))
                .filter(log -> !eventScoped || auditLogMatchesAnyEvent(log, eventIds))
                .toList();

        Map<String, Long> auditCounts = scopedAuditLogs.stream()
                .collect(java.util.stream.Collectors.groupingBy(
                        log -> log.getActionType() == null ? "UNKNOWN" : log.getActionType().name(),
                        TreeMap::new,
                        java.util.stream.Collectors.counting()
                ));

        List<List<String>> rows = new ArrayList<>();
        rows.add(row("Section", "Metric", "Value", "Scope", "Notes"));
        rows.add(row("Scope", "Year", year == null ? "All years" : year, "", ""));
        rows.add(row("Scope", "Season", season == null ? "All seasons" : season.name(), "", ""));
        rows.add(row("Participation", "Events", events.size(), "system", ""));
        rows.add(row("Participation", "Teams", teams.size(), "scoped events", ""));
        rows.add(row("Participation", "Rankings", rankings.size(), "scoped events", ""));
        rows.add(row("Scoring", "Confirmed Scores", confirmedScores.size(), "scoped events", ""));
        rows.add(row("Scoring", "ICC One-Way Estimate",
                formatNullable(calculateIccOneWay(confirmedScores)),
                "scoped events",
                "Confirmed non-disqualified official scores"));
        rows.add(row("Users", "Total Users", userRepository.count(), "system", ""));
        rows.add(row("Users", "Active Users", userRepository.countByStatus(UserStatus.ACTIVE), "system", ""));
        rows.add(row("Users", "Unverified Users", userRepository.countByStatus(UserStatus.UNVERIFIED), "system", ""));
        rows.add(row("Audit", "Scoped Audit Actions", scopedAuditLogs.size(), "system", ""));
        rows.add(row("", "", "", "", ""));

        rows.add(row("Event", "Name", "Status", "Teams", "ICC One-Way Estimate"));
        for (HackathonEvent event : events) {
            List<Score> eventScores = scoreRepository.findConfirmedScoresForRblDashboard(
                    event.getId(),
                    null,
                    null
            );
            rows.add(row(
                    "Event",
                    event.getName(),
                    event.getStatus(),
                    teamRepository.findForTeamListReport(event.getId(), null, null).size(),
                    formatNullable(calculateIccOneWay(eventScores))
            ));
        }
        rows.add(row("", "", "", "", ""));

        rows.add(row("Audit Action", "Count", "", "", ""));
        for (Map.Entry<String, Long> entry : auditCounts.entrySet()) {
            rows.add(row("Audit Action", entry.getKey(), entry.getValue(), "", ""));
        }

        return rows;
    }

    private ExportJobResponse createAndProcessJob(
            User actor,
            ExportSpec spec,
            List<List<String>> rows,
            String filePrefix
    ) {
        return createAndProcessJob(actor, spec, rows, filePrefix, Map.of());
    }

    private ExportJobResponse createAndProcessJob(
            User actor,
            ExportSpec spec,
            List<List<String>> rows,
            String filePrefix,
            Map<String, Object> extraParams
    ) {
        Map<String, Object> param = new LinkedHashMap<>();

        if (spec.event() != null) {
            param.put("eventId", spec.event().getId().toString());
        }
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
        if (extraParams != null && !extraParams.isEmpty()) {
            param.putAll(extraParams);
        }

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
                exportAuditState(spec, param),
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
                            "eventId", spec.event() == null ? "SYSTEM" : spec.event().getId().toString()
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
                            "eventId", spec.event() == null ? "SYSTEM" : spec.event().getId().toString()
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
                slug(event == null ? "system" : event.getName()),
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

    private List<String> row(Object... values) {
        return Arrays.stream(values)
                .map(this::text)
                .toList();
    }

    private String formatNullable(Double value) {
        return value == null ? "" : "%.4f".formatted(value);
    }

    private Double average(List<Double> values) {
        if (values == null || values.isEmpty()) {
            return null;
        }

        DoubleSummaryStatistics statistics = values.stream()
                .filter(Objects::nonNull)
                .mapToDouble(Double::doubleValue)
                .summaryStatistics();
        return statistics.getCount() == 0 ? null : statistics.getAverage();
    }

    private double round(double value) {
        return Math.round(value * 10000d) / 10000d;
    }

    private Double calculateIccOneWay(List<Score> scores) {
        if (scores == null || scores.isEmpty()) {
            return null;
        }

        Map<String, List<Double>> valuesByScoredItem = scores.stream()
                .filter(score -> score.getSubmission() != null
                        && score.getSubmission().getId() != null
                        && score.getEventCriteria() != null
                        && score.getEventCriteria().getId() != null
                        && score.getValue() != null)
                .collect(java.util.stream.Collectors.groupingBy(
                        score -> score.getSubmission().getId()
                                + ":"
                                + score.getEventCriteria().getId(),
                        LinkedHashMap::new,
                        java.util.stream.Collectors.mapping(
                                score -> score.getValue().doubleValue(),
                                java.util.stream.Collectors.toList()
                        )
                ));

        int groupCount = valuesByScoredItem.size();
        int observationCount = valuesByScoredItem.values()
                .stream()
                .mapToInt(List::size)
                .sum();
        if (groupCount < 2 || observationCount <= groupCount) {
            return null;
        }

        double grandMean = valuesByScoredItem.values()
                .stream()
                .flatMap(Collection::stream)
                .mapToDouble(Double::doubleValue)
                .average()
                .orElse(0d);

        double betweenGroupSquares = 0d;
        double withinGroupSquares = 0d;
        for (List<Double> groupValues : valuesByScoredItem.values()) {
            double groupMean = groupValues.stream()
                    .mapToDouble(Double::doubleValue)
                    .average()
                    .orElse(0d);
            betweenGroupSquares += groupValues.size() * Math.pow(groupMean - grandMean, 2);
            for (Double value : groupValues) {
                withinGroupSquares += Math.pow(value - groupMean, 2);
            }
        }

        double meanSquareBetween = betweenGroupSquares / (groupCount - 1);
        double meanSquareWithin = withinGroupSquares / (observationCount - groupCount);
        double averageRatingsPerSubmission = (double) observationCount / groupCount;
        double denominator = meanSquareBetween
                + (averageRatingsPerSubmission - 1d) * meanSquareWithin;
        if (denominator == 0d) {
            return null;
        }

        return round((meanSquareBetween - meanSquareWithin) / denominator);
    }

    private boolean auditLogMatchesAnyEvent(AuditLog log, Set<UUID> eventIds) {
        if (eventIds == null || eventIds.isEmpty() || log == null) {
            return false;
        }
        if (log.getTargetId() != null
                && ("hackathon_events".equalsIgnoreCase(log.getTargetTable())
                || "events".equalsIgnoreCase(log.getTargetTable()))
                && eventIds.contains(log.getTargetId())) {
            return true;
        }
        return containsAnyEventId(log.getBeforeState(), eventIds)
                || containsAnyEventId(log.getAfterState(), eventIds)
                || containsAnyEventId(log.getContext(), eventIds);
    }

    private boolean containsAnyEventId(Map<String, Object> state, Set<UUID> eventIds) {
        if (state == null || state.isEmpty()) {
            return false;
        }
        Object direct = state.get("eventId");
        if (matchesAnyEventId(direct, eventIds)) {
            return true;
        }
        for (Object value : state.values()) {
            if (matchesAnyEventId(value, eventIds)) {
                return true;
            }
            if (value instanceof Map<?, ?> nested) {
                Object nestedEventId = nested.get("eventId");
                if (matchesAnyEventId(nestedEventId, eventIds)) {
                    return true;
                }
            }
            if (value instanceof Iterable<?> iterable) {
                for (Object item : iterable) {
                    if (matchesAnyEventId(item, eventIds)) {
                        return true;
                    }
                    if (item instanceof Map<?, ?> nestedItem
                            && matchesAnyEventId(nestedItem.get("eventId"), eventIds)) {
                        return true;
                    }
                }
            }
        }
        return false;
    }

    private boolean matchesAnyEventId(Object raw, Set<UUID> eventIds) {
        return raw != null && eventIds.stream()
                .anyMatch(eventId -> eventId.toString().equals(raw.toString()));
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

    private EventExportRequest eventExportRequestFromParams(Map<String, Object> params) {
        return new EventExportRequest(
                parseOptionalUUID(params.get("roundId"), "roundId"),
                parseOptionalUUID(params.get("trackId"), "trackId"),
                normalizeFormat(params.get("format")),
                parseBoolean(params.get("includeDraftScores"), false),
                parseBoolean(params.get("includeDisqualified"), false),
                parseBoolean(params.get("anonymize"), false)
        );
    }

    private Map<String, Object> exportAuditState(
            ExportSpec spec,
            Map<String, Object> params
    ) {
        Map<String, Object> state = new LinkedHashMap<>();
        state.put("exportType", spec.type().name());
        if (spec.event() != null) {
            state.put("eventId", spec.event().getId().toString());
        }
        state.put("format", spec.format());
        if (params != null) {
            if (params.containsKey("roundId")) {
                state.put("roundId", params.get("roundId"));
            }
            if (params.containsKey("trackId")) {
                state.put("trackId", params.get("trackId"));
            }
            if (params.containsKey("year")) {
                state.put("year", params.get("year"));
            }
            if (params.containsKey("season")) {
                state.put("season", params.get("season"));
            }
            if (params.containsKey("scope")) {
                state.put("scope", params.get("scope"));
            }
        }
        return state;
    }

    private HackathonEvent getEvent(UUID eventId) {
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
        if (round.getEvent() == null || !eventId.equals(round.getEvent().getId())) {
            throw new BadRequestException("Round does not belong to the requested event.");
        }
    }

    private void validateTrackBelongsToEvent(UUID trackId, UUID eventId) {
        if (trackId == null) {
            return;
        }
        Track track = trackRepository.findById(trackId)
                .orElseThrow(() -> new BadRequestException("Track not found"));
        if (track.getEvent() == null || !eventId.equals(track.getEvent().getId())) {
            throw new BadRequestException("Track does not belong to the requested event.");
        }
    }

    private List<List<String>> buildRblDatasetRows(List<Score> scores) {
        List<List<String>> rows = new ArrayList<>();
        rows.add(List.of(
                "hashedJudgeId",
                "judgeType",
                "hashedTrackId",
                "hashedRoundId",
                "criterionId",
                "criterionType",
                "technical",
                "hashedSubmissionId",
                "rawScore",
                "maxScore",
                "weight",
                "createdAtBucket"
        ));

        for (Score score : scores) {
            EventCriteria criterion = score.getEventCriteria();
            Submission submission = score.getSubmission();
            Team team = submission.getTeam();
            Track track = team == null ? null : team.getTrack();
            Round round = submission.getRound();

            String criterionType = criterion.getCriteria() == null
                    || criterion.getCriteria().getCategory() == null
                    ? ""
                    : criterion.getCriteria().getCategory().name();
            String createdAtBucket = score.getScoredAt() == null
                    ? ""
                    : score.getScoredAt().toLocalDate().toString();

            rows.add(List.of(
                    rblHashId(score.getJudge().getId()),
                    text(score.getJudge().getJudgeType()),
                    rblHashId(track == null ? null : track.getId()),
                    rblHashId(round == null ? null : round.getId()),
                    text(criterion.getId()),
                    criterionType,
                    text(Boolean.TRUE.equals(criterion.getEffectiveIsTechnical())),
                    rblHashId(submission.getId()),
                    text(score.getValue()),
                    text(criterion.getEffectiveMaxScore()),
                    text(criterion.getEffectiveWeight()),
                    createdAtBucket
            ));
        }

        return rows;
    }

    private String rblHashId(UUID id) {
        if (id == null) {
            return "";
        }
        try {
            MessageDigest digest = MessageDigest.getInstance("SHA-256");
            byte[] hash = digest.digest((RBL_HASH_PREFIX + id)
                    .getBytes(StandardCharsets.UTF_8));
            return HexFormat.of().formatHex(hash);
        } catch (NoSuchAlgorithmException ex) {
            throw new IllegalStateException("SHA-256 is not available.", ex);
        }
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

    private Integer parseOptionalInteger(Object value, String fieldName) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            return Integer.parseInt(value.toString());
        } catch (NumberFormatException ex) {
            throw new BadRequestException(String.format("Invalid %s: %s", fieldName, value));
        }
    }

    private HackathonSeason parseOptionalSeason(Object value) {
        if (value == null || value.toString().isBlank()) {
            return null;
        }
        try {
            return HackathonSeason.valueOf(value.toString().trim().toUpperCase(Locale.ROOT));
        } catch (IllegalArgumentException ex) {
            throw new BadRequestException("Invalid season: " + value);
        }
    }

    private void ensureCanExport(User user) {
        if (user == null || (!user.isAdmin() && !user.isCoordinator())) {
            throw new ForbiddenException("Only admin or coordinator can exports.");
        }
    }

    private void ensureAdminCanExportSystemReports(User user) {
        if (user == null || !user.isAdmin()) {
            throw new ForbiddenException("Only system admin can export annual or system reports.");
        }
    }

    private void ensureDownloadable(ExportJob job) {
        if (job.getStatus() != ExportJobStatus.DONE) {
            throw new ConflictException("Export job is not ready for download.");
        }
        if (job.isExpired(LocalDateTime.now())) {
            throw new ConflictException("Export file has expired.");
        }
        if (job.getFileName() == null || job.getFileName().isBlank()) {
            throw new ConflictException("Export file metadata is missing.");
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
