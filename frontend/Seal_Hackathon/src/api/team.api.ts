import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  CreateTeamRequest,
  InviteMemberRequest,
  LeaveTeamRequest,
  RejectInvitationRequest,
  RemoveMemberRequest,
  TeamDetailResponse,
  TeamInvitationResponse,
  TeamMemberResponse,
  TeamResponse,
  TeamSummaryResponse,
  ToggleJoinCodeRequest,
  TransferLeaderRequest,
  UpdateTeamRequest,
} from "@/types/team.types";

export const teamApi = {
  createTeam(payload: CreateTeamRequest) {
    return apiRequest.post<TeamResponse>("/teams", payload);
  },

  getMyTeams() {
    return apiRequest.get<TeamSummaryResponse[]>("/teams/me");
  },

  getTeamById(teamId: UUID) {
    return apiRequest.get<TeamDetailResponse>(`/teams/${teamId}`);
  },

  updateTeam(teamId: UUID, payload: UpdateTeamRequest) {
    return apiRequest.patch<TeamResponse>(`/teams/${teamId}`, payload);
  },

  inviteMember(teamId: UUID, payload: InviteMemberRequest) {
    return apiRequest.post<TeamInvitationResponse>(
      `/teams/${teamId}/invite`,
      payload,
    );
  },

  getTeamMembers(teamId: UUID) {
    return apiRequest.get<TeamMemberResponse[]>(`/teams/${teamId}/members`);
  },

  removeMember(teamId: UUID, memberId: UUID, payload?: RemoveMemberRequest) {
    return apiRequest.delete<void>(`/teams/${teamId}/members/${memberId}`, { data: payload });
  },

  acceptInvitation(invitationId: UUID) {
    return apiRequest.post<TeamMemberResponse>(
      `/teams/invitations/${invitationId}/accept`,
    );
  },

  rejectInvitation(invitationId: UUID, payload: RejectInvitationRequest) {
    return apiRequest.post<void>(
      `/teams/invitations/${invitationId}/reject`,
      payload,
    );
  },

  transferLeader(teamId: UUID, payload: TransferLeaderRequest) {
    return apiRequest.post<TeamResponse>(
      `/teams/${teamId}/transfer-leader`,
      payload,
    );
  },

  leaveTeam(teamId: UUID, payload: LeaveTeamRequest) {
    return apiRequest.post<void>(`/teams/${teamId}/leave`, payload);
  },

  toggleJoinCode(teamId: UUID, payload: ToggleJoinCodeRequest) {
    return apiRequest.patch<TeamResponse>(`/teams/${teamId}/join-code`, payload);
  },
};
