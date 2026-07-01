package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.ExportType;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
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

import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class ExportServiceImpl implements ExportService {

    private final CurrentUserService currentUserService;
    private final ObjectMapper objectMapper;

    @Transactional
    @Override
    public ExportJobResponse createExportJob(CreateExportJobRequest request, Authentication authentication) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureCanExport(actor);

        ExportType exportType = parseExportType(request.exportType());
        Map<String, Object> params = normalizeParams(request.params());

        UUID eventId = parseUUID(params.get("eventId"), "eventId");
        UUID trackId = parseOptionalUUID(params.get("trackId"), "trackId");
        UUID roundId = parseOptionalUUID(params.get("roundId"), "roundId");

        
        return null;
    }

    @Transactional
    @Override
    public ExportJobResponse exportEventRanking(UUID eventId, EventExportRequest request, Authentication authentication) {
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
