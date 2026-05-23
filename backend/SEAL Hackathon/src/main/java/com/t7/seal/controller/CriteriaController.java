package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.criteria.CreateScoringCriteriaRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.criteria.ScoringCriteriaResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
public class CriteriaController {

    @GetMapping("/criteria")
    public ResponseEntity<PageResponse<ScoringCriteriaResponse>> getScoringCriteria(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isTechnical,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @PostMapping("/criteria")
    public ResponseEntity<ScoringCriteriaResponse> createScoringCriteria(
            @Valid @RequestBody CreateScoringCriteriaRequest request
    ) {
        return null;
    }

    @GetMapping("/criteria/{criteriaId}")
    public ResponseEntity<ScoringCriteriaResponse> getScoringCriteriaById(
            @PathVariable UUID criteriaId
    ) {
        return ResponseEntity.ok(criteriaService.getScoringCriteriaById(criteriaId));
    }

    @PatchMapping("/criteria/{criteriaId}")
    public ResponseEntity<ScoringCriteriaResponse> updateScoringCriteria(
            @PathVariable UUID criteriaId,
            @Valid @RequestBody UpdateScoringCriteriaRequest request
    ) {
        return ResponseEntity.ok(criteriaService.updateScoringCriteria(criteriaId, request));
    }

    @PatchMapping("/criteria/{criteriaId}/deactivate")
    public ResponseEntity<ScoringCriteriaResponse> deactivateScoringCriteria(@PathVariable UUID criteriaId) {
        return ResponseEntity.ok(criteriaService.deactivateScoringCriteria(criteriaId));
    }

    @GetMapping("/events/{eventId}/criteria")
    public ResponseEntity<List<EventCriteriaResponse>> getEventCriteria(
            @PathVariable UUID eventId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isTechnical
    ) {
        return ResponseEntity.ok(eventCriteriaService.getEventCriteria(eventId, isActive, isTechnical));
    }

    @PostMapping("/events/{eventId}/criteria")
    public ResponseEntity<EventCriteriaResponse> createEventCriteria(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateEventCriteriaRequest request
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(eventCriteriaService.createEventCriteria(eventId, request));
    }

    @PatchMapping("/event-criteria/{eventCriteriaId}")
    public ResponseEntity<EventCriteriaResponse> updateEventCriteria(
            @PathVariable UUID eventCriteriaId,
            @Valid @RequestBody UpdateEventCriteriaRequest request
    ) {
        return ResponseEntity.ok(eventCriteriaService.updateEventCriteria(eventCriteriaId, request));
    }

    @DeleteMapping("/event-criteria/{eventCriteriaId}")
    public ResponseEntity<Void> deleteEventCriteria(@PathVariable UUID eventCriteriaId) {
        eventCriteriaService.deleteEventCriteria(eventCriteriaId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/rounds/{roundId}/criteria")
    public ResponseEntity<List<EventCriteriaResponse>> getCriteriaByRound(@PathVariable UUID roundId) {
        return ResponseEntity.ok(eventCriteriaService.getCriteriaByRound(roundId));
    }
}

