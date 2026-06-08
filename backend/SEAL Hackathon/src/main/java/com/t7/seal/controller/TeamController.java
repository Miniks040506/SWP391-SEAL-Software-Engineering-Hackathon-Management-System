package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.*;
import com.t7.seal.response.team.*;
import com.t7.seal.service.TeamService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/teams")
@RequiredArgsConstructor
public class TeamController {

    private final TeamService teamService;

    //1
    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.createTeam(request, authentication));
    }

    //2
    @GetMapping("/me")
    public ResponseEntity<List<TeamSummaryResponse>> getMyTeams(
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getMyTeams(authentication));
    }

    //3
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDetailResponse> getTeamById(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamById(teamId, authentication));
    }

    //4
    @PatchMapping("/{teamId}")
    public ResponseEntity<TeamResponse> updateTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody UpdateTeamRequest request
    ) {
        return null;
    }

    @PostMapping("/{teamId}/invite")
    public ResponseEntity<TeamInvitationResponse> inviteMember(
            @PathVariable UUID teamId,
            @Valid @RequestBody InviteMemberRequest request
    ) {
        return null;
    }

    //5
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @PathVariable UUID teamId
    ) {
        return null;
    }

    //6
    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId,
            @RequestBody(required = false) ReasonRequest request
    ) {
        return null;
    }

    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitation(
            @PathVariable UUID invitationId
    ) {
        return null;
    }

    @PostMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable UUID invitationId,
            @Valid @RequestBody ReasonRequest request
    ) {
        return null;
    }

    //7
    @PostMapping("/{teamId}/transfer-leader")
    public ResponseEntity<TeamResponse> transferLeader(
            @PathVariable UUID teamId,
            @Valid @RequestBody TransferLeaderRequest request
    ) {
        return null;
    }

    //8
    @PostMapping("/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody ReasonRequest request
    ) {
        return null;
    }

    @PatchMapping("/{teamId}/join-code")
    public ResponseEntity<TeamResponse> toggleJoinCode(
            @PathVariable UUID teamId,
            @Valid @RequestBody ToggleJoinCodeRequest request
    ) {
        return null;
    }
}
