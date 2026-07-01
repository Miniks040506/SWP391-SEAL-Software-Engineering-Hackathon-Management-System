package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.ExportType;
import com.t7.seal.domain.SubmissionStatus;
import com.t7.seal.dto.ExportSpec;
import com.t7.seal.entities.*;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.HackathonEventRepository;
import com.t7.seal.repository.RankingRepository;
import com.t7.seal.request.system.CreateExportJobRequest;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.ExportDownloadResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.ExportService;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    private final HackathonEventRepository hackathonEventRepository;
    private final RankingRepository rankingRepository;

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

        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse exportEventScores(UUID eventId, EventExportRequest request, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse exportEventTeamList(UUID eventId, EventExportRequest request, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public PageResponse<ExportJobResponse> getMyExportJobs(String status, String exportType, int page, int size, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse getExportJobById(UUID exportId, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public ExportDownloadResponse downloadExport(UUID exportId, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public ResponseEntity<Resource> downloadExportFile(UUID exportId, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse retryExport(UUID exportId, Authentication authentication) {
        return null;
    }

    @Transactional
    @Override
    public void deleteExport(UUID exportId, Authentication authentication) {

    }

    //HELPERS
    private String text(Object value) {
        return value == null ? "" : value.toString();
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
