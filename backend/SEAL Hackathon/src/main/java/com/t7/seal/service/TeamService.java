package com.t7.seal.service;

import com.t7.seal.request.team.*;
import com.t7.seal.request.track.RegisterTeamTrackRequest;
import com.t7.seal.response.team.*;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface TeamService {
    TeamResponse createTeam(CreateTeamRequest request, Authentication authentication);

    List<TeamSummaryResponse> getMyTeams(Authentication authentication);

    TeamDetailResponse getTeamById(UUID teamId, Authentication authentication);

    TeamResponse updateTeam(UUID teamId, UpdateTeamRequest request, Authentication authentication);

    TeamInvitationResponse inviteMember(UUID teamId, InviteMemberRequest request, Authentication authentication);

    List<TeamInvitationResponse> getTeamInvitations(UUID teamId, Authentication authentication);

    List<TeamInvitationResponse> getMyInvitations(Authentication authentication);

    TeamInvitationResponse getInvitationByToken(String token);

    TeamJoinCodePreviewResponse previewJoinCode(String joinCode, Authentication authentication);

    TeamMemberResponse joinByCode(JoinTeamByCodeRequest request, Authentication authentication);

    TeamMemberResponse joinByCode(String joinCode, Authentication authentication);

    List<TeamMemberResponse> getTeamMembers(UUID teamId, Authentication authentication);

    void removeTeamMember(UUID teamId, UUID memberId, ReasonRequest reason, Authentication authentication);

    TeamMemberResponse acceptInvitation(UUID invitationId, Authentication authentication);

    TeamMemberResponse acceptInvitationByToken(String token, Authentication authentication);

    void rejectInvitation(UUID invitationId, ReasonRequest request, Authentication authentication);

    void rejectInvitationByToken(String token, ReasonRequest request, Authentication authentication);

    void rejectInvitationByToken(String token, ReasonRequest request);

    void cancelInvitation(UUID invitationId, Authentication authentication);

    TeamResponse transferLeader(UUID teamId, TransferLeaderRequest request, Authentication authentication);

    void leaveTeam(UUID teamId, ReasonRequest request, Authentication authentication);

    TeamResponse toggleJoinCode(UUID teamId, ToggleJoinCodeRequest request, Authentication authentication);

    TeamResponse registerTeamForTrack(UUID teamId, RegisterTeamTrackRequest request, Authentication authentication);

    EventCompetitionResponse getMyEventCompetition(UUID eventId, Authentication authentication);

    List<EventCompetitionSummaryResponse> getMyActiveCompetitions(Authentication authentication);

    TeamAdvancementStatusResponse getMyTeamAdvancementStatus(UUID teamId, UUID roundId, Authentication authentication);
}
