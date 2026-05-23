package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.*;
import com.t7.seal.response.team.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/teams")
@RequiredArgsConstructor
public class TeamController {

    @PostMapping
    public ResponseEntity<TeamResponse> createTeam(
            @Valid @RequestBody CreateTeamRequest request
    ) {
        return null;
    }

    @GetMapping("/me")
    public ResponseEntity<List<TeamSummaryResponse>> getMyTeams() {
        return null;
    }

    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDetailResponse> getTeamById(
            @PathVariable UUID teamId
    ) {
        return null;
    }

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

    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @PathVariable UUID teamId
    ) {
        return null;
    }

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

    @PostMapping("/{teamId}/transfer-leader")
    public ResponseEntity<TeamResponse> transferLeader(
            @PathVariable UUID teamId,
            @Valid @RequestBody TransferLeaderRequest request
    ) {
        return null;
    }

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
