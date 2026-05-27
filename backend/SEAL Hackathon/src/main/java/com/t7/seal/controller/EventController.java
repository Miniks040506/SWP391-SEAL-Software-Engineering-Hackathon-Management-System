package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.event.UpdateEventRequest;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.request.event.CreateEventRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.event.EventDetailResponse;
import com.t7.seal.response.event.EventSummaryResponse;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.system.VarianceDashboardResponse;
import com.t7.seal.service.EventService;
import com.t7.seal.service.RankingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/events")
@RequiredArgsConstructor
public class EventController {

    private final EventService eventService;
    private final RankingService rankingService;

    @PostMapping
    public ResponseEntity<EventDetailResponse> createEvent(
            @Valid @RequestBody CreateEventRequest request
    ) {
        return ResponseEntity.ok(eventService.createEvent(request));
    }

    @GetMapping
    public ResponseEntity<PageResponse<EventSummaryResponse>> getPublicEvents(
            @RequestParam(required = false) String season,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(eventService.getPublicEvent(season, year, status, size, page));
    }

    @GetMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> getEventById(@PathVariable UUID eventId
    ) {
        return ResponseEntity.ok(eventService.getEventById(eventId));
    }

    @PatchMapping("/{eventId}")
    public ResponseEntity<EventDetailResponse> updateEvent(
            @PathVariable UUID eventId,
            @Valid @RequestBody UpdateEventRequest request
    ) {
        return null;
    }

    @DeleteMapping("/{eventId}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID eventId) {
        return null;
    }

    @GetMapping("/{eventId}/ranking")
    public ResponseEntity<List<RankingResponse>> getEventRanking(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, roundId, trackId));
    }

    @PostMapping("/{eventId}/publish-results")
    public ResponseEntity<PublishResultsResponse> publishResults(
            @PathVariable UUID eventId,
            @Valid @RequestBody PublishResultsRequest request
    ) {
        return null;
    }

    @GetMapping("/{eventId}/variance-dashboard")
    public ResponseEntity<VarianceDashboardResponse> getVarianceDashboard(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) String criteriaType,
            @RequestParam(required = false) String judgeType
    ) {
        return null;
    }
}
