import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type {
  CoordinatorTeamDetailResponse,
  CoordinatorTeamListParams,
  CoordinatorTeamSummaryResponse,
  CreateTeamRequest,
  InviteMemberRequest,
  JoinTeamByCodeRequest,
  LeaveTeamRequest,
  RejectInvitationRequest,
  RemoveMemberRequest,
  MentorTeamDetailResponse,
  TeamDetailResponse,
  TeamInvitationResponse,
  TeamJoinCodePreviewResponse,
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

  getCoordinatorEventTeams(
    eventId: UUID,
    params?: Omit<CoordinatorTeamListParams, "eventId">,
  ) {
    return apiRequest.get<PageResponse<CoordinatorTeamSummaryResponse>>(
      `/events/${eventId}/teams`,
      { params },
    );
  },

  getCoordinatorTeamSummary(teamId: UUID) {
    return apiRequest.get<CoordinatorTeamDetailResponse>(
      `/teams/${teamId}/summary`,
    );
  },

  updateTeam(teamId: UUID, payload: UpdateTeamRequest) {
    return apiRequest.patch<TeamResponse>(`/teams/${teamId}`, payload);
  },

  inviteMember(teamId: UUID, payload: InviteMemberRequest) {
    return apiRequest.post<TeamInvitationResponse>(
      `/teams/${teamId}/invitations`,
      payload,
    );
  },

  getTeamInvitations(teamId: UUID) {
    return apiRequest.get<TeamInvitationResponse[]>(
      `/teams/${teamId}/invitations`,
    );
  },

  getTeamMembers(teamId: UUID) {
    return apiRequest.get<TeamMemberResponse[]>(`/teams/${teamId}/members`);
  },

  removeMember(teamId: UUID, memberId: UUID, payload?: RemoveMemberRequest) {
    return apiRequest.delete<void>(`/teams/${teamId}/members/${memberId}`, {
      data: payload,
    });
  },

  transferLeader(teamId: UUID, payload: TransferLeaderRequest) {
    return apiRequest.post<TeamResponse>(
      `/teams/${teamId}/transfer-leader`,
      payload,
    );
  },

  leaveTeam(teamId: UUID, payload?: LeaveTeamRequest) {
    return apiRequest.post<void>(`/teams/${teamId}/leave`, payload ?? {});
  },

  toggleJoinCode(teamId: UUID, payload: ToggleJoinCodeRequest) {
    return apiRequest.patch<TeamResponse>(
      `/teams/${teamId}/join-code`,
      payload,
    );
  },

  previewJoinCode(joinCode: string) {
    return apiRequest.get<TeamJoinCodePreviewResponse>(
      `/teams/join-code/${encodeURIComponent(joinCode)}`,
    );
  },

  joinByCode(payload: JoinTeamByCodeRequest) {
    return apiRequest.post<TeamMemberResponse>("/teams/join-code", payload);
  },

  joinByCodePath(joinCode: string) {
    return apiRequest.post<TeamMemberResponse>(
      `/teams/join-code/${encodeURIComponent(joinCode)}`,
    );
  },

  getMyInvitations() {
    return apiRequest.get<TeamInvitationResponse[]>("/invitations/me");
  },

  getInvitationByToken(token: string) {
    return apiRequest.get<TeamInvitationResponse>(
      `/invitations/token/${encodeURIComponent(token)}`,
    );
  },

  acceptInvitation(invitationId: UUID) {
    return apiRequest.post<TeamMemberResponse>(
      `/invitations/${invitationId}/accept`,
    );
  },

  acceptInvitationByToken(token: string) {
    return apiRequest.post<TeamMemberResponse>(
      `/invitations/token/${encodeURIComponent(token)}/accept`,
    );
  },

  rejectInvitation(invitationId: UUID, payload?: RejectInvitationRequest) {
    return apiRequest.post<void>(
      `/invitations/${invitationId}/reject`,
      payload ?? {},
    );
  },

  rejectInvitationByToken(token: string, payload?: RejectInvitationRequest) {
    return apiRequest.post<void>(
      `/invitations/token/${encodeURIComponent(token)}/reject`,
      payload ?? {},
    );
  },

  cancelInvitation(invitationId: UUID) {
    return apiRequest.post<void>(`/invitations/${invitationId}/cancel`);
  },

  getAssignedTeamDetails(teamId: UUID) {
    return apiRequest.get<MentorTeamDetailResponse>(`/mentor/teams/${teamId}`);
  },
};
