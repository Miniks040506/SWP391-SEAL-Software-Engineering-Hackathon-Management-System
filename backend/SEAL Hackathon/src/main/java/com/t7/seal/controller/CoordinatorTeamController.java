package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.RejectTeamRegistrationRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamDetailResponse;
import com.t7.seal.response.coordinator.CoordinatorTeamSummaryResponse;
import com.t7.seal.service.CoordinatorTeamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
@Tag(
        name = "Coordinator Teams",
        description = "Coordinator team search, review, and registration decisions."
)
public class CoordinatorTeamController {

    private final CoordinatorTeamService coordinatorTeamService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/events/{eventId}/teams")
    public ResponseEntity<PageResponse<CoordinatorTeamSummaryResponse>> getEventTeams(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID trackId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String registrationStatus,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(coordinatorTeamService.getEventTeams(
                eventId,
                trackId,
                status,
                registrationStatus,
                search,
                page,
                size,
                authentication
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/teams/{teamId}/summary")
    public ResponseEntity<CoordinatorTeamDetailResponse> getTeamSummary(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(coordinatorTeamService.getTeamSummary(teamId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/teams/{teamId}/registration/approve")
    public ResponseEntity<CoordinatorTeamDetailResponse> approveRegistration(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(coordinatorTeamService.approveRegistration(teamId, authentication));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @PostMapping("/teams/{teamId}/registration/reject")
    public ResponseEntity<CoordinatorTeamDetailResponse> rejectRegistration(
            @PathVariable UUID teamId,
            @Valid @RequestBody RejectTeamRegistrationRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(coordinatorTeamService.rejectRegistration(teamId, request, authentication));
    }
}
