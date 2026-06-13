package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.*;
import com.t7.seal.response.team.*;
import com.t7.seal.service.TeamService;
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
@RequestMapping(ApiPaths.API_V1 + "/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.createTeam(request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/me")
    public ResponseEntity<List<TeamSummaryResponse>> getMyTeams(Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyTeams(authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/join-code/{joinCode}")
    public ResponseEntity<TeamJoinCodePreviewResponse> previewJoinCode(
            @PathVariable String joinCode,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.previewJoinCode(joinCode, authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/join-code")
    public ResponseEntity<TeamMemberResponse> joinByCode(
            @Valid @RequestBody JoinTeamByCodeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.joinByCode(request, authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @PostMapping("/join-code/{joinCode}")
    public ResponseEntity<TeamMemberResponse> joinByCodePath(
            @PathVariable String joinCode,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.joinByCode(joinCode, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/invitations/me")
    public ResponseEntity<List<TeamInvitationResponse>> getMyInvitations(Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyInvitations(authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDetailResponse> getTeamById(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamById(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{teamId}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody UpdateTeamRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.updateTeam(teamId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping({"/{teamId}/invitations", "/{teamId}/invite"})
    public ResponseEntity<TeamInvitationResponse> inviteMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody InviteMemberRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.inviteMember(teamId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{teamId}/invitations")
    public ResponseEntity<List<TeamInvitationResponse>> getTeamInvitations(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamInvitations(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId,
            @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.removeTeamMember(teamId, memberId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitation(
            @PathVariable UUID invitationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.acceptInvitation(invitationId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable UUID invitationId,
            @Valid @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.rejectInvitation(invitationId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{teamId}/transfer-leader")
    public ResponseEntity<TeamResponse> transferLeader(
            @PathVariable UUID teamId,
            @Valid @RequestBody TransferLeaderRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.transferLeader(teamId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.leaveTeam(teamId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{teamId}/join-code")
    public ResponseEntity<TeamResponse> toggleJoinCode(
            @PathVariable UUID teamId,
            @Valid @RequestBody ToggleJoinCodeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.toggleJoinCode(teamId, request, authentication));
    }
}
