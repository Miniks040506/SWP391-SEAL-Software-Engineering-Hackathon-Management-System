import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type {
  CreateTeamRequest,
  InviteMemberRequest,
  LeaveTeamRequest,
  RemoveMemberRequest,
  TransferLeaderRequest,
  UpdateTeamRequest,
} from "@/types/team.types";

import { mockTeamService } from "../mocks/participantTeams.mock";

const USE_MOCK_TEAMS = false;

export const participantTeamQueryKeys = {
  myTeams: ["participant-my-teams"] as const,
  detail: (teamId?: string) => ["participant-team-detail", teamId] as const,
  members: (teamId?: string) => ["participant-team-members", teamId] as const,
  invitations: (teamId?: string) => ["participant-team-invitations", teamId] as const,
};

export function useMyTeamsQuery() {
  return useQuery({
    queryKey: participantTeamQueryKeys.myTeams,
    queryFn: async () => {
      if (USE_MOCK_TEAMS) return mockTeamService.getMyTeams();
      return teamApi.getMyTeams();
    },
  });
}

export function useTeamDetailQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.detail(teamId),
    queryFn: async () => {
      if (USE_MOCK_TEAMS) return mockTeamService.getTeamById(teamId as UUID);
      return teamApi.getTeamById(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamMembersQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.members(teamId),
    queryFn: async () => {
      if (USE_MOCK_TEAMS) return mockTeamService.getTeamMembers(teamId as UUID);
      return teamApi.getTeamMembers(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamInvitationsQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.invitations(teamId),
    queryFn: async () => {
      if (USE_MOCK_TEAMS) return mockTeamService.getTeamInvitations(teamId as UUID);
      return teamApi.getTeamInvitations(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: CreateTeamRequest) => {
      if (USE_MOCK_TEAMS) return mockTeamService.createTeam(payload);
      return teamApi.createTeam(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: Team created successfully." : "Team created successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to create team.", { variant: "error" }),
  });
}

export function useUpdateTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: UpdateTeamRequest) => {
      if (USE_MOCK_TEAMS) return mockTeamService.updateTeam(teamId as UUID, payload);
      return teamApi.updateTeam(teamId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.detail(teamId) });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: Team updated successfully." : "Team updated successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to update team.", { variant: "error" }),
  });
}

export function useInviteTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: InviteMemberRequest) => {
      if (USE_MOCK_TEAMS) return mockTeamService.inviteMember(teamId as UUID, payload);
      return teamApi.inviteMember(teamId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.invitations(teamId) });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: Invitation sent successfully." : "Invitation sent successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to send invitation.", { variant: "error" }),
  });
}

export function useCancelTeamInvitationMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (invitationId: UUID) => {
      if (USE_MOCK_TEAMS) return mockTeamService.cancelInvitation(invitationId);
      return teamApi.cancelInvitation(invitationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.invitations(teamId) });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: Invitation cancelled." : "Invitation cancelled successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to cancel invitation.", { variant: "error" }),
  });
}

export function useRemoveTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({ memberId, payload }: { memberId: UUID; payload?: RemoveMemberRequest }) => {
      if (USE_MOCK_TEAMS) return mockTeamService.removeMember(teamId as UUID, memberId, payload);
      return teamApi.removeMember(teamId as UUID, memberId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.detail(teamId) });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.members(teamId) });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: Member removed." : "Member removed successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to remove member.", { variant: "error" }),
  });
}

export function useTransferTeamLeaderMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: TransferLeaderRequest) => {
      if (USE_MOCK_TEAMS) return mockTeamService.transferLeader(teamId as UUID, payload);
      return teamApi.transferLeader(teamId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.detail(teamId) });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: Team leader transferred." : "Team leader transferred successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to transfer team leader.", { variant: "error" }),
  });
}

export function useLeaveTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload?: LeaveTeamRequest) => {
      if (USE_MOCK_TEAMS) return mockTeamService.leaveTeam(teamId as UUID, payload ?? {});
      return teamApi.leaveTeam(teamId as UUID, payload ?? {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.detail(teamId) });
      enqueueSnackbar(USE_MOCK_TEAMS ? "Mock: You left the team." : "You left the team successfully.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to leave team.", { variant: "error" }),
  });
}