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
  JoinTeamByCodeRequest,
} from "@/types/team.types";

export const participantTeamQueryKeys = {
  myTeams: ["participant-my-teams"] as const,
  detail: (teamId?: string) => ["participant-team-detail", teamId] as const,
  members: (teamId?: string) => ["participant-team-members", teamId] as const,
  invitations: (teamId?: string) =>
    ["participant-team-invitations", teamId] as const,
  myInvitations: ["participant-my-invitations"] as const,
  invitationToken: (token: string) =>
    ["participant-invitation-token", token] as const,
};

export function useMyTeamsQuery() {
  return useQuery({
    queryKey: participantTeamQueryKeys.myTeams,
    queryFn: async () => {
      return teamApi.getMyTeams();
    },
  });
}

export function useTeamDetailQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.detail(teamId),
    queryFn: async () => {
      return teamApi.getTeamById(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamMembersQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.members(teamId),
    queryFn: async () => {
      return teamApi.getTeamMembers(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamInvitationsQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.invitations(teamId),
    queryFn: async () => {
      return teamApi.getTeamInvitations(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useMyInvitationsQuery() {
  return useQuery({
    queryKey: participantTeamQueryKeys.myInvitations,
    queryFn: async () => {
      return teamApi.getMyInvitations();
    },
  });
}

export function useInvitationByTokenQuery(token: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.invitationToken(token),
    queryFn: async () => {
      return teamApi.getInvitationByToken(token);
    },
    enabled: Boolean(token),
    retry: false,
  });
}

// 2. MUTATIONS (Cập nhật, thay đổi dữ liệu)
export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: CreateTeamRequest) => {
      return teamApi.createTeam(payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Team created successfully.", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to create team.", { variant: "error" }),
  });
}

export function useUpdateTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: UpdateTeamRequest) => {
      return teamApi.updateTeam(teamId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Team updated successfully.", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to update team.", { variant: "error" }),
  });
}

export function useInviteTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: InviteMemberRequest) => {
      return teamApi.inviteMember(teamId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.invitations(teamId),
      });
      enqueueSnackbar("Invitation sent successfully.", { variant: "success" });
    },
    onError: (error: any) => {
      const msg = error.message || "Failed to send invitation.";
      enqueueSnackbar(msg, { variant: "error" });
    },
  });
}

export function useCancelTeamInvitationMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (invitationId: UUID) => {
      return teamApi.cancelInvitation(invitationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.invitations(teamId),
      });
      enqueueSnackbar("Invitation cancelled successfully.", {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to cancel invitation.", { variant: "error" }),
  });
}

export function useRemoveTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async ({
      memberId,
      payload,
    }: {
      memberId: UUID;
      payload?: RemoveMemberRequest;
    }) => {
      return teamApi.removeMember(teamId as UUID, memberId, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.members(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Member removed successfully.", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to remove member.", { variant: "error" }),
  });
}

export function useTransferTeamLeaderMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: TransferLeaderRequest) => {
      return teamApi.transferLeader(teamId as UUID, payload);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Team leader transferred successfully.", {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to transfer team leader.", { variant: "error" }),
  });
}

export function useLeaveTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload?: LeaveTeamRequest) => {
      return teamApi.leaveTeam(teamId as UUID, payload ?? {});
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      enqueueSnackbar("You left the team successfully.", {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to leave team.", { variant: "error" }),
  });
}

const removeInvitationFromCache = (queryClient: any, idOrToken: string, isToken = false) => {
  queryClient.setQueryData(participantTeamQueryKeys.myInvitations, (oldData: any) => {
    if (!oldData) return oldData;
    const list = oldData.data || oldData;
    const filtered = list.filter((inv: any) => isToken ? inv.token !== idOrToken : inv.id !== idOrToken);
    return oldData.data ? { ...oldData, data: filtered } : filtered;
  });
};


export function useAcceptInvitationMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (invitationId: UUID) => {
      return teamApi.acceptInvitation(invitationId);
    },
    onMutate: async (invitationId) => {
      removeInvitationFromCache(queryClient, invitationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myInvitations });
      enqueueSnackbar("You have joined the team successfully!", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to accept invitation.", { variant: "error" }),
  });
}

export function useRejectInvitationMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (invitationId: UUID) => {
      return teamApi.rejectInvitation(invitationId);
    },
    onMutate: async (invitationId) => {
      removeInvitationFromCache(queryClient, invitationId);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myInvitations });
      enqueueSnackbar("Invitation declined.", { variant: "info" });
    },
    onError: () => enqueueSnackbar("Failed to decline invitation.", { variant: "error" }),
  });
}

export function useAcceptInvitationByTokenMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (token: string) => {
      return teamApi.acceptInvitationByToken(token);
    },
    onMutate: async (token) => {
      removeInvitationFromCache(queryClient, token, true);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myTeams });
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myInvitations });
      enqueueSnackbar("You have joined the team successfully!", { variant: "success" });
    },
    onError: (error: any) => enqueueSnackbar(error.message || "Failed to accept invitation.", { variant: "error" }),
  });
}

export function useRejectInvitationByTokenMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (token: string) => {
      return teamApi.rejectInvitationByToken(token);
    },
    onMutate: async (token) => {
      removeInvitationFromCache(queryClient, token, true);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myInvitations });
      enqueueSnackbar("Invitation declined.", { variant: "info" });
    },
    onError: (error: any) => enqueueSnackbar(error.message || "Failed to decline invitation.", { variant: "error" }),
  });
}

export function usePreviewJoinCodeMutation() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (joinCode: string) => {
      return teamApi.previewJoinCode(joinCode);
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || "Invalid join code.", {
        variant: "error",
      });
    },
  });
}

export function useJoinTeamByCodeMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: JoinTeamByCodeRequest) => {
      return teamApi.joinByCode(payload);
    },
    onSuccess: async () => {
      // Cập nhật lại danh sách team sau khi join thành công
      await queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("You have successfully joined the team!", {
        variant: "success",
      });
    },
    onError: (err: any) => {
      enqueueSnackbar(err.message || "Failed to join team.", {
        variant: "error",
      });
    },
  });
}


