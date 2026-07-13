package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.CreateTeamJoinRequest;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.response.team.TeamJoinRequestResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.service.TeamJoinRequestService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
@Tag(
        name = "Team Join Requests",
        description = "Participant join requests and leader decisions."
)
public class TeamJoinRequestController {

    private final TeamJoinRequestService joinRequestService;

    @PostMapping("/teams/{teamId}/join-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<TeamJoinRequestResponse> create(
            @PathVariable UUID teamId,
            @Valid @RequestBody(required = false) CreateTeamJoinRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(joinRequestService.create(teamId, request, authentication));
    }

    @GetMapping("/teams/{teamId}/join-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TeamJoinRequestResponse>> getForTeam(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(joinRequestService.getForTeam(teamId, authentication));
    }

    @GetMapping("/teams/join-requests/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TeamJoinRequestResponse>> getForCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(joinRequestService.getForCurrentUser(authentication));
    }

    @PostMapping("/teams/join-requests/{requestId}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeamMemberResponse> accept(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(joinRequestService.accept(requestId, authentication));
    }

    @PostMapping("/teams/join-requests/{requestId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> reject(
            @PathVariable UUID requestId,
            @Valid @RequestBody(required = false) ReasonRequest reason,
            Authentication authentication
    ) {
        joinRequestService.reject(requestId, reason, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/team-join-requests/token/{token}")
    public ResponseEntity<TeamJoinRequestResponse> getByToken(@PathVariable String token) {
        return ResponseEntity.ok(joinRequestService.getByToken(token));
    }

    @PostMapping("/team-join-requests/token/{token}/accept")
    public ResponseEntity<TeamMemberResponse> acceptByToken(@PathVariable String token) {
        return ResponseEntity.ok(joinRequestService.acceptByToken(token));
    }

    @PostMapping("/team-join-requests/token/{token}/reject")
    public ResponseEntity<Void> rejectByToken(
            @PathVariable String token,
            @Valid @RequestBody(required = false) ReasonRequest reason
    ) {
        joinRequestService.rejectByToken(token, reason);
        return ResponseEntity.noContent().build();
    }
}
