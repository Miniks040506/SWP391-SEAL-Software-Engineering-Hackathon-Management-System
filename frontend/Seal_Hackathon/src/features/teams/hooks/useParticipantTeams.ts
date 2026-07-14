import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { teamApi } from "@/api/team.api";
import { NOTIFICATION_QUERY_KEY } from "@/features/notification/hooks/useNotificationQueries";
import { mockTeamService } from "../mocks/participantTeams.mock"; 
import type { UUID } from "@/types/common.types";
import type {
  CreateTeamRequest,
  DeleteTeamRequest,
  InviteMemberRequest,
  LeaveTeamRequest,
  RemoveMemberRequest,
  TransferLeaderRequest,
  UpdateTeamRequest,
  JoinTeamByCodeRequest,
} from "@/types/team.types";

const USE_MOCK = false;
const activeTeamService = USE_MOCK ? mockTeamService : teamApi;

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
      return activeTeamService.getMyTeams();
    },
  });
}

export function useMyActiveCompetitionsQuery(enabled = true) {
  return useQuery({
    queryKey: ["my-active-competitions"],
    queryFn: async () => {
      return activeTeamService.getMyActiveCompetitions();
    },
    enabled,
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

export function useTeamDetailQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.detail(teamId),
    queryFn: async () => {
      return activeTeamService.getTeamById(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamMembersQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.members(teamId),
    queryFn: async () => {
      return activeTeamService.getTeamMembers(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useTeamInvitationsQuery(teamId?: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.invitations(teamId),
    queryFn: async () => {
      return activeTeamService.getTeamInvitations(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useMyInvitationsQuery(enabled = true) {
  return useQuery({
    queryKey: participantTeamQueryKeys.myInvitations,
    queryFn: async () => {
      return activeTeamService.getMyInvitations();
    },
    enabled,
    refetchInterval: 10_000,
    refetchOnMount: "always",
    refetchOnReconnect: "always",
    refetchOnWindowFocus: "always",
  });
}

export function useInvitationByTokenQuery(token: string) {
  return useQuery({
    queryKey: participantTeamQueryKeys.invitationToken(token),
    queryFn: async () => {
      return activeTeamService.getInvitationByToken(token);
    },
    enabled: Boolean(token),
    retry: false,
  });
}

export function useCreateTeamMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: CreateTeamRequest) => {
      return activeTeamService.createTeam(payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
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
      return activeTeamService.updateTeam(teamId as UUID, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Team updated successfully.", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to update team.", { variant: "error" }),
  });
}

export function useDeleteTeamMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload?: DeleteTeamRequest) => {
      return activeTeamService.deleteTeam(teamId as UUID, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      enqueueSnackbar("Team deleted successfully.", { variant: "success" });
    },
    onError: (error: any) =>
      enqueueSnackbar(error.message || "Failed to delete team.", {
        variant: "error",
      }),
  });
}

export function useInviteTeamMemberMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (payload: InviteMemberRequest) => {
      return activeTeamService.inviteMember(teamId as UUID, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.invitations(teamId),
      });
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEY],
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
      return activeTeamService.cancelInvitation(invitationId);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
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
      return activeTeamService.removeMember(teamId as UUID, memberId, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.members(teamId),
      });
      void queryClient.invalidateQueries({
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
      return activeTeamService.transferLeader(teamId as UUID, payload);
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      void queryClient.invalidateQueries({
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
      return activeTeamService.leaveTeam(teamId as UUID, payload ?? {});
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      void queryClient.invalidateQueries({
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
        return activeTeamService.acceptInvitation(invitationId);
      },
      onMutate: async (invitationId) => {
        removeInvitationFromCache(queryClient, invitationId);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: participantTeamQueryKeys.myTeams,
        });
        void queryClient.invalidateQueries({
          queryKey: participantTeamQueryKeys.myInvitations,
        });
        void queryClient.invalidateQueries({
          queryKey: [NOTIFICATION_QUERY_KEY],
        });
        enqueueSnackbar("You have joined the team successfully!", {
          variant: "success",
        });
      },
      onError: () =>
        enqueueSnackbar("Failed to accept invitation.", { variant: "error" }),
    });
  }

  export function useRejectInvitationMutation() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
      mutationFn: async (invitationId: UUID) => {
        return activeTeamService.rejectInvitation(invitationId);
      },
      onMutate: async (invitationId) => {
        removeInvitationFromCache(queryClient, invitationId);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: participantTeamQueryKeys.myInvitations,
        });
        void queryClient.invalidateQueries({
          queryKey: [NOTIFICATION_QUERY_KEY],
        });
        enqueueSnackbar("Invitation declined.", { variant: "info" });
      },
      onError: () =>
        enqueueSnackbar("Failed to decline invitation.", { variant: "error" }),
    });
  }

export function useAcceptInvitationByTokenMutation() {
    const queryClient = useQueryClient();
    const { enqueueSnackbar } = useSnackbar();

    return useMutation({
      mutationFn: async (token: string) => {
        return activeTeamService.acceptInvitationByToken(token);
      },
      onMutate: async (token) => {
        removeInvitationFromCache(queryClient, token, true);
      },
      onSuccess: () => {
        void queryClient.invalidateQueries({
          queryKey: participantTeamQueryKeys.myTeams,
        });
        void queryClient.invalidateQueries({
          queryKey: participantTeamQueryKeys.myInvitations,
        });
        void queryClient.invalidateQueries({
          queryKey: [NOTIFICATION_QUERY_KEY],
        });
        enqueueSnackbar("You have joined the team successfully!", {
          variant: "success",
        });
      },
      onError: (error: any) =>
        enqueueSnackbar(error.message || "Failed to accept invitation.", {
          variant: "error",
        }),
    });
  }

export function useRejectInvitationByTokenMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (token: string) => {
      return activeTeamService.rejectInvitationByToken(token);
    },
    onMutate: async (token) => {
      removeInvitationFromCache(queryClient, token, true);
    },
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: participantTeamQueryKeys.myInvitations });
      await queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
      enqueueSnackbar("Invitation declined.", { variant: "info" });
    },
    onError: (error: any) => enqueueSnackbar(error.message || "Failed to decline invitation.", { variant: "error" }),
  });
}

export function usePreviewJoinCodeMutation() {
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: async (joinCode: string) => {
      return activeTeamService.previewJoinCode(joinCode);
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
      return activeTeamService.joinByCode(payload);
    },
    onSuccess: () => {
      // Cập nhật lại danh sách team sau khi join thành công
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      void queryClient.invalidateQueries({
        queryKey: [NOTIFICATION_QUERY_KEY],
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

export function useToggleJoinCodeMutation(teamId?: string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (enabled: boolean) =>
      activeTeamService.toggleJoinCode(teamId as UUID, { enabled }),
    onSuccess: () => {
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.detail(teamId),
      });
      void queryClient.invalidateQueries({
        queryKey: participantTeamQueryKeys.myTeams,
      });
      enqueueSnackbar("Join code setting updated.", { variant: "success" });
    },
    onError: () =>
      enqueueSnackbar("Failed to update join code setting.", { variant: "error" }),
  });
}
