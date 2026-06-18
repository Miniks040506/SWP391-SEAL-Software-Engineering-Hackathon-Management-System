import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";

import { teamApi } from "@/api/team.api";
import type { UUID } from "@/types/common.types";
import type {
  CreateTeamJoinRequest,
  FormingTeamListParams,
} from "@/types/team.types";

export const teamJoinRequestQueryKeys = {
  formingTeams: (params?: FormingTeamListParams) =>
    ["forming-teams", params ?? {}] as const,
  myRequests: ["my-team-join-requests"] as const,
  teamRequests: (teamId?: UUID) => ["team-join-requests", teamId] as const,
  token: (token: string) => ["team-join-request-token", token] as const,
};

export function useFormingTeamsQuery(params?: FormingTeamListParams) {
  return useQuery({
    queryKey: teamJoinRequestQueryKeys.formingTeams(params),
    queryFn: () => teamApi.getFormingTeams(params),
  });
}

export function useRequestToJoinTeamMutation() {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({
      teamId,
      payload,
    }: {
      teamId: UUID;
      payload?: CreateTeamJoinRequest;
    }) => teamApi.requestToJoinTeam(teamId, payload),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ["forming-teams"] }),
        queryClient.invalidateQueries({
          queryKey: teamJoinRequestQueryKeys.myRequests,
        }),
      ]);
      enqueueSnackbar("Join request sent to the team leader.", {
        variant: "success",
      });
    },
    onError: (error: Error) => {
      enqueueSnackbar(error.message || "Failed to send join request.", {
        variant: "error",
      });
    },
  });
}

export function useJoinRequestByTokenQuery(token: string) {
  return useQuery({
    queryKey: teamJoinRequestQueryKeys.token(token),
    queryFn: () => teamApi.getJoinRequestByToken(token),
    enabled: Boolean(token),
    retry: false,
  });
}

export function useTeamJoinRequestsQuery(teamId?: UUID, enabled = true) {
  return useQuery({
    queryKey: teamJoinRequestQueryKeys.teamRequests(teamId),
    queryFn: () => teamApi.getTeamJoinRequests(teamId as UUID),
    enabled: Boolean(teamId) && enabled,
  });
}

export function useAcceptJoinRequestMutation(teamId?: UUID) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: (requestId: UUID) => teamApi.acceptJoinRequest(requestId),
    onSuccess: async () => {
      await Promise.all([
        queryClient.invalidateQueries({
          queryKey: teamJoinRequestQueryKeys.teamRequests(teamId),
        }),
        queryClient.invalidateQueries({ queryKey: ["participant-team-detail", teamId] }),
        queryClient.invalidateQueries({ queryKey: ["participant-team-members", teamId] }),
        queryClient.invalidateQueries({ queryKey: ["participant-my-teams"] }),
      ]);
      enqueueSnackbar("Join request accepted.", { variant: "success" });
    },
    onError: (error: Error) =>
      enqueueSnackbar(error.message || "Failed to accept join request.", {
        variant: "error",
      }),
  });
}

export function useRejectJoinRequestMutation(teamId?: UUID) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  return useMutation({
    mutationFn: ({ requestId, reason }: { requestId: UUID; reason?: string }) =>
      teamApi.rejectJoinRequest(requestId, { reason }),
    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: teamJoinRequestQueryKeys.teamRequests(teamId),
      });
      enqueueSnackbar("Join request rejected.", { variant: "info" });
    },
    onError: (error: Error) =>
      enqueueSnackbar(error.message || "Failed to reject join request.", {
        variant: "error",
      }),
  });
}

export function useAcceptJoinRequestByTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => teamApi.acceptJoinRequestByToken(token),
    onSuccess: async (_data, token) => {
      await queryClient.invalidateQueries({
        queryKey: teamJoinRequestQueryKeys.token(token),
      });
    },
  });
}

export function useRejectJoinRequestByTokenMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (token: string) => teamApi.rejectJoinRequestByToken(token),
    onSuccess: async (_data, token) => {
      await queryClient.invalidateQueries({
        queryKey: teamJoinRequestQueryKeys.token(token),
      });
    },
  });
}
