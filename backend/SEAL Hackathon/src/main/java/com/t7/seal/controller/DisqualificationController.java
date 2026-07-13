package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.CreateDisqualificationRequest;
import com.t7.seal.request.results.OverturnDisqualificationRequest;
import com.t7.seal.request.results.UpdateAppealRequest;
import com.t7.seal.response.results.DisqualificationResponse;
import com.t7.seal.service.DisqualificationService;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Disqualifications",
        description = "Disqualification, appeal, overturn, and active-case lookup."
)
public class DisqualificationController {

    private final DisqualificationService disqualificationService;

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/disqualifications")
    public ResponseEntity<DisqualificationResponse> createDisqualificationSubmission(
            @Valid @RequestBody CreateDisqualificationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(disqualificationService
                        .createDisqualificationSubmission(request, authentication));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR','ADMIN','STUDENT')")
    @GetMapping("/disqualifications/{disqualificationId}")
    public ResponseEntity<DisqualificationResponse> getDisqualificationById(
            @PathVariable UUID disqualificationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .getDisqualificationById(disqualificationId, authentication));
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'COORDINATOR')")
    @PatchMapping("/disqualifications/{disqualificationId}/appeal")
    public ResponseEntity<DisqualificationResponse> updateAppeal(
            @PathVariable UUID disqualificationId,
            @Valid @RequestBody UpdateAppealRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .updateAppeal(disqualificationId, request, authentication));
    }

    @PreAuthorize("hasRole('COORDINATOR')")
    @PostMapping("/disqualifications/{disqualificationId}/overturn")
    public ResponseEntity<DisqualificationResponse> overturnDisqualification(
            @PathVariable UUID disqualificationId,
            @Valid @RequestBody OverturnDisqualificationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .overturnDisqualification(disqualificationId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('COORDINATOR', 'ADMIN')")
    @GetMapping("/events/{eventId}/disqualifications")
    public ResponseEntity<List<DisqualificationResponse>> getEventDisqualifications(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String appealStatus,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService.getDisqualificationsByEvent(
                eventId, roundId, trackId, appealStatus, authentication));
    }

    @PreAuthorize("hasAnyRole('STUDENT', 'COORDINATOR', 'ADMIN')")
    @GetMapping("/teams/{teamId}/disqualifications/active")
    public ResponseEntity<List<DisqualificationResponse>> getActiveTeamDisqualifications(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(disqualificationService
                .getActiveDisqualificationsByTeam(teamId, authentication));
    }
}
