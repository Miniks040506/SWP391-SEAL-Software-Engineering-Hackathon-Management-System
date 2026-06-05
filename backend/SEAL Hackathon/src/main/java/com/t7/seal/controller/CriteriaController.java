package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.criteria.CreateEventCriteriaRequest;
import com.t7.seal.request.criteria.CreateScoringCriteriaRequest;
import com.t7.seal.request.criteria.UpdateEventCriteriaRequest;
import com.t7.seal.request.criteria.UpdateScoringCriteriaRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.criteria.ScoringCriteriaResponse;
import com.t7.seal.service.CriteriaService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
public class CriteriaController {

    private final CriteriaService criteriaService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/criteria")
    public ResponseEntity<PageResponse<ScoringCriteriaResponse>> getScoringCriteria(
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isTechnical,
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return ResponseEntity.ok(criteriaService.getScoringCriteria(
                isActive, isTechnical, category, page, size
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/criteria")
    public ResponseEntity<ScoringCriteriaResponse> createScoringCriteria(
            @Valid @RequestBody CreateScoringCriteriaRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(criteriaService.createScoringCriteria(request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/criteria/{criteriaId}")
    public ResponseEntity<ScoringCriteriaResponse> getScoringCriteriaById(
            @PathVariable UUID criteriaId
    ) {
        return ResponseEntity.ok(criteriaService.getScoringCriteriaById(criteriaId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PatchMapping("/criteria/{criteriaId}")
    public ResponseEntity<ScoringCriteriaResponse> updateScoringCriteria(
            @PathVariable UUID criteriaId,
            @Valid @RequestBody UpdateScoringCriteriaRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(criteriaService.updateScoringCriteria(criteriaId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PatchMapping("/criteria/{criteriaId}/deactivate")
    public ResponseEntity<ScoringCriteriaResponse> deactivateScoringCriteria(
            @PathVariable UUID criteriaId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(criteriaService.deactivateScoringCriteria(criteriaId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PatchMapping("/criteria/{criteriaId}/activate")
    public ResponseEntity<ScoringCriteriaResponse> activateScoringCriteria(
            @PathVariable UUID criteriaId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(criteriaService.activateScoringCriteria(criteriaId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @DeleteMapping("/criteria/{criteriaId}")
    public ResponseEntity<Void> deleteScoringCriteria(
            @PathVariable UUID criteriaId,
            Authentication authentication
    ) {
        criteriaService.deleteScoringCriteria(criteriaId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR', 'JUDGE')")
    @GetMapping("/events/{eventId}/criteria")
    public ResponseEntity<List<EventCriteriaResponse>> getEventCriteria(
            @PathVariable UUID eventId,
            @RequestParam(required = false) Boolean isActive,
            @RequestParam(required = false) Boolean isTechnical
    ) {
        return ResponseEntity.ok(criteriaService.getEventCriteria(eventId, isActive, isTechnical));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/events/{eventId}/criteria")
    public ResponseEntity<EventCriteriaResponse> createEventCriteria(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateEventCriteriaRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(criteriaService.createEventCriteria(eventId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PatchMapping("/event-criteria/{eventCriteriaId}")
    public ResponseEntity<EventCriteriaResponse> updateEventCriteria(
            @PathVariable UUID eventCriteriaId,
            @Valid @RequestBody UpdateEventCriteriaRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.ACCEPTED)
                .body(criteriaService.updateEventCriteria(eventCriteriaId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @DeleteMapping("/event-criteria/{eventCriteriaId}")
    public ResponseEntity<Void> deleteEventCriteria(
            @PathVariable UUID eventCriteriaId,
            Authentication authentication
    ) {
        criteriaService.deleteEventCriteria(eventCriteriaId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('JUDGE', 'COORDINATOR')")
    @GetMapping("/rounds/{roundId}/criteria")
    public ResponseEntity<List<EventCriteriaResponse>> getCriteriaByRound(
            @PathVariable UUID roundId
    ) {
        return ResponseEntity.ok(criteriaService.getCriteriaByRound(roundId));
    }
}

