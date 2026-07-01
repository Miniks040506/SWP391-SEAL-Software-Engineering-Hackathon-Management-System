package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.event.UpdateEventRequest;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.request.event.CreateEventRequest;
import com.t7.seal.request.system.ExportRblDatasetRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.UploadFileResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.system.ExportJobResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import com.t7.seal.service.CloudinaryStorageService;
import com.t7.seal.service.EventService;
import com.t7.seal.service.RankingService;
import com.t7.seal.service.RblResearchService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final RankingService rankingService;
    private final CloudinaryStorageService cloudinaryStorageService;
    private final RblResearchService rblResearchService;

    @PreAuthorize("@eventSecurity.canCreateEvent(authentication)")
    @PostMapping(
            value = "/banner",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public ResponseEntity<UploadFileResponse> uploadEventBanner(
            @RequestPart("file") MultipartFile file
    ) {
        return ResponseEntity.ok(
                new UploadFileResponse(
                        cloudinaryStorageService.uploadEventBanner(file)));
    }

    @PreAuthorize("@eventSecurity.canCreateEvent(authentication)")
    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request,
            Authentication authentication
    ) {
        EventDetailResponse response = eventService.createEvent(request, authentication);
//        return new ResponseEntity<>(response, HttpStatus.CREATED);
        return ResponseEntity.status(HttpStatus.CREATED).body(response); // 2 method to create response
    }

    @GetMapping
    public ResponseEntity<PageResponse<EventSummaryResponse>> getPublicEvents(
            @RequestParam(required = false) String season,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size
    ) {
        return ResponseEntity.ok(eventService.getPublicEvent(season, year, status, size, page));
    }

    @GetMapping("/all")
    public ResponseEntity<PageResponse<EventSummaryResponse>> getAllEvents(
            @RequestParam(required = false) String season,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "6") int size) {
        return ResponseEntity.ok(eventService.getAllEvents(season, year, status, size, page));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> getEventById(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.getEventById(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PatchMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> updateEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateEventRequest request,
            Authentication authentication
    ) {
        EventDetailResponse ev = eventService.updateEvent(eventId, request, authentication);
        return ResponseEntity.accepted().body(ev);
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PostMapping("/{eventId}/advance-status")
    public ResponseEntity<EventDetailResponse> advanceEventStatus(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.advanceEventStatus(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PostMapping("/{eventId}/cancel")
    public ResponseEntity<EventDetailResponse> cancelEvent(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(eventService.cancelEvent(eventId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(
            @PathVariable UUID eventId,
            Authentication authentication) {
        eventService.deleteEvent(eventId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{eventId}/ranking")
    public ResponseEntity<List<RankingResponse>> getEventRanking(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PostMapping("/{eventId}/publish-results")
    public ResponseEntity<PublishResultsResponse> publishResults(
            @PathVariable UUID eventId,
            @Valid @RequestBody(required = false) PublishResultsRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.publishEventResults(eventId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/{eventId}/variance-dashboard")
    public ResponseEntity<VarianceDashboardResponse> getVarianceDashboard(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String criteriaType,
            @RequestParam(required = false) String judgeType,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rblResearchService.getVarianceDashboard(
                eventId,
                roundId,
                trackId,
                criteriaType,
                judgeType,
                authentication
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/{eventId}/exports/rbl-dataset")
    public ResponseEntity<ExportJobResponse> exportRblDataset(
            @PathVariable UUID eventId,
            @RequestBody(required = false) ExportRblDatasetRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(rblResearchService.exportAnonymizedDataset(eventId, request, authentication));
    }
}
