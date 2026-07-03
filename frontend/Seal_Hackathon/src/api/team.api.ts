import { apiRequest } from "@/api/apiRequest";
import type { PageResponse, UUID } from "@/types/common.types";
import type { TeamDetailedScoreResponse } from "@/types/ranking.types";
import type {
  CoordinatorTeamDetailResponse,
  CoordinatorTeamListParams,
  CoordinatorTeamSummaryResponse,
  CreateTeamRequest,
  DeleteTeamRequest,
  CreateTeamJoinRequest,
  EventCompetitionResponse,
  EventCompetitionSummaryResponse,
  FormingTeamListParams,
  FormingTeamResponse,
  InviteMemberRequest,
  JoinTeamByCodeRequest,
  LeaveTeamRequest,
  RejectInvitationRequest,
  RejectTeamRegistrationRequest,
  RemoveMemberRequest,
  MentorTeamDetailResponse,
  TeamDetailResponse,
  TeamInvitationResponse,
  TeamJoinCodePreviewResponse,
  TeamJoinRequestResponse,
  TeamMemberResponse,
  TeamResponse,
  TeamSummaryResponse,
  TeamAdvancementStatusResponse,
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

  getMyActiveCompetitions() {
    return apiRequest.get<EventCompetitionSummaryResponse[]>("/teams/competitions/me");
  },

  getMyEventCompetition(eventId: UUID) {
    return apiRequest.get<EventCompetitionResponse>(
      `/events/${eventId}/competition/me`,
    );
  },

  getTeamAdvancementStatus(teamId: UUID, roundId?: UUID) {
    const url = roundId
      ? `/teams/${teamId}/rounds/${roundId}/advancement-status`
      : `/teams/${teamId}/advancement-status`;
    return apiRequest.get<TeamAdvancementStatusResponse>(url);
  },

  getTeamPublishedScores(teamId: UUID) {
    return apiRequest.get<TeamDetailedScoreResponse[]>(`/teams/${teamId}/scores`);
  },

  getTeamPublishedRoundScore(teamId: UUID, roundId: UUID) {
    return apiRequest.get<TeamDetailedScoreResponse>(
      `/teams/${teamId}/rounds/${roundId}/scores`,
    );
  },

  getFormingTeams(params?: FormingTeamListParams) {
    return apiRequest.get<PageResponse<FormingTeamResponse>>("/teams/forming", {
      params,
    });
  },

  requestToJoinTeam(teamId: UUID, payload?: CreateTeamJoinRequest) {
    return apiRequest.post<TeamJoinRequestResponse>(
      `/teams/${teamId}/join-requests`,
      payload ?? {},
    );
  },

  getTeamJoinRequests(teamId: UUID) {
    return apiRequest.get<TeamJoinRequestResponse[]>(
      `/teams/${teamId}/join-requests`,
    );
  },

  acceptJoinRequest(requestId: UUID) {
    return apiRequest.post<TeamMemberResponse>(
      `/teams/join-requests/${requestId}/accept`,
    );
  },

  rejectJoinRequest(requestId: UUID, payload?: RejectInvitationRequest) {
    return apiRequest.post<void>(
      `/teams/join-requests/${requestId}/reject`,
      payload ?? {},
    );
  },

  getMyJoinRequests() {
    return apiRequest.get<TeamJoinRequestResponse[]>("/teams/join-requests/me");
  },

  getJoinRequestByToken(token: string) {
    return apiRequest.get<TeamJoinRequestResponse>(
      `/team-join-requests/token/${encodeURIComponent(token)}`,
    );
  },

  acceptJoinRequestByToken(token: string) {
    return apiRequest.post<TeamMemberResponse>(
      `/team-join-requests/token/${encodeURIComponent(token)}/accept`,
    );
  },

  rejectJoinRequestByToken(token: string, payload?: RejectInvitationRequest) {
    return apiRequest.post<void>(
      `/team-join-requests/token/${encodeURIComponent(token)}/reject`,
      payload ?? {},
    );
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

  approveTeamRegistration(teamId: UUID) {
    return apiRequest.post<CoordinatorTeamDetailResponse>(
      `/teams/${teamId}/registration/approve`,
    );
  },

  rejectTeamRegistration(teamId: UUID, payload: RejectTeamRegistrationRequest) {
    return apiRequest.post<CoordinatorTeamDetailResponse>(
      `/teams/${teamId}/registration/reject`,
      payload,
    );
  },
  updateTeam(teamId: UUID, payload: UpdateTeamRequest) {
    return apiRequest.patch<TeamResponse>(`/teams/${teamId}`, payload);
  },

  deleteTeam(teamId: UUID, payload?: DeleteTeamRequest) {
    return apiRequest.delete<void>(`/teams/${teamId}`, {
      data: payload ?? {},
    });
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
