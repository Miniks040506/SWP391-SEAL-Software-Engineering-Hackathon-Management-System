package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.response.team.TeamInvitationResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/invitations")
@RequiredArgsConstructor
public class TeamInvitationController {

    private final TeamService teamService;

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<List<TeamInvitationResponse>> getMyInvitations(Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyInvitations(authentication));
    }

    @GetMapping("/token/{token}")
    public ResponseEntity<TeamInvitationResponse> getInvitationByToken(@PathVariable String token) {
        return ResponseEntity.ok(teamService.getInvitationByToken(token));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitation(
            @PathVariable UUID invitationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.acceptInvitation(invitationId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/token/{token}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitationByToken(
            @PathVariable String token,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.acceptInvitationByToken(token, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable UUID invitationId,
            @Valid @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.rejectInvitation(invitationId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/token/{token}/reject")
    public ResponseEntity<Void> rejectInvitationByToken(
            @PathVariable String token,
            @Valid @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.rejectInvitationByToken(token, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{invitationId}/cancel")
    public ResponseEntity<Void> cancelInvitation(
            @PathVariable UUID invitationId,
            Authentication authentication
    ) {
        teamService.cancelInvitation(invitationId, authentication);
        return ResponseEntity.noContent().build();
    }
}
