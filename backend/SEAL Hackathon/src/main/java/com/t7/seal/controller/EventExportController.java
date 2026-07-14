package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.EventExportRequest;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.service.ExportService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/events/{eventId}/exports")
@Tag(
        name = "Event Exports",
        description = "Create event ranking, score, and team-list exports."
)
public class EventExportController {

    private final ExportService exportService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/ranking")
    public ResponseEntity<ExportJobResponse> exportRanking(
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventExportRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.exportEventRanking(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/scores")
    public ResponseEntity<ExportJobResponse> exportScores(
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventExportRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.exportEventScores(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/team-list")
    public ResponseEntity<ExportJobResponse> exportTeamList(
            @PathVariable UUID eventId,
            @RequestBody(required = false) EventExportRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(exportService.exportEventTeamList(eventId, request, authentication));
    }
}