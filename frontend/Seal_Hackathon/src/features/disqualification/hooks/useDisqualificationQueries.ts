import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { disqualificationApi } from "@/api/disqualification.api";
import type { UUID } from "@/types/common.types";
import type {
  DisqualificationResponse,
  DisqualifySubmissionRequest,
  GetEventDisqualificationsParams,
  OverturnDisqualificationRequest,
  UpdateAppealRequest,
} from "@/types/disqualification.types";

export const disqualificationQueryKeys = {
  all: ["disqualifications"] as const,
  eventDisqualifications: (
    eventId: UUID,
    params?: GetEventDisqualificationsParams,
  ) => [...disqualificationQueryKeys.all, "event", eventId, params] as const,
  activeByTeam: (teamId: UUID) =>
    [...disqualificationQueryKeys.all, "team", teamId, "active"] as const,
  byId: (disqualificationId: UUID) =>
    [...disqualificationQueryKeys.all, "detail", disqualificationId] as const,
};

export const useEventDisqualificationsQuery = (
  eventId?: UUID,
  params?: GetEventDisqualificationsParams,
) => {
  return useQuery<DisqualificationResponse[]>({
    queryKey: disqualificationQueryKeys.eventDisqualifications(
      eventId!,
      params,
    ),
    queryFn: () =>
      disqualificationApi.getEventDisqualifications(eventId!, params),
    enabled: !!eventId,
  });
};

export const useActiveTeamDisqualificationsQuery = (teamId?: UUID) => {
  return useQuery<DisqualificationResponse[]>({
    queryKey: disqualificationQueryKeys.activeByTeam(teamId!),
    queryFn: () => disqualificationApi.getActiveTeamDisqualifications(teamId!),
    enabled: !!teamId,
  });
};

export const useDisqualificationByIdQuery = (disqualificationId?: UUID) => {
  return useQuery<DisqualificationResponse>({
    queryKey: disqualificationQueryKeys.byId(disqualificationId!),
    queryFn: () =>
      disqualificationApi.getDisqualificationById(disqualificationId!),
    enabled: !!disqualificationId,
  });
};

export const useDisqualifySubmissionMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      submissionId,
      payload,
    }: {
      submissionId: UUID;
      payload: DisqualifySubmissionRequest;
    }) => disqualificationApi.disqualifySubmissionById(submissionId, payload),
    onSuccess: (data: DisqualificationResponse) => {
      if (data?.rankingRecalculated) {
        sessionStorage.setItem("rankingRecalculated", "true");
      }
      queryClient.invalidateQueries({
        queryKey: disqualificationQueryKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      queryClient.invalidateQueries({
        queryKey: ["participant-team-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["participant-submission-detail"],
      });
      queryClient.invalidateQueries({ queryKey: ["public-events", "prizes"] });
      queryClient.invalidateQueries({
        queryKey: ["coordinator-events", "prizes"],
      });
      queryClient.invalidateQueries({ queryKey: ["participant-my-teams"] });
      queryClient.invalidateQueries({ queryKey: ["participant-team-detail"] });
    },
  });
};

export const useOverturnDisqualificationMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disqualificationId,
      payload,
    }: {
      disqualificationId: UUID;
      payload: OverturnDisqualificationRequest;
    }) =>
      disqualificationApi.overturnDisqualification(disqualificationId, payload),
    onSuccess: (data: DisqualificationResponse) => {
      if (data?.rankingRecalculated) {
        sessionStorage.setItem("rankingRecalculated", "true");
      }
      queryClient.invalidateQueries({
        queryKey: disqualificationQueryKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: ["rankings"] });
      queryClient.invalidateQueries({
        queryKey: ["participant-team-submissions"],
      });
      queryClient.invalidateQueries({
        queryKey: ["participant-submission-detail"],
      });
      queryClient.invalidateQueries({ queryKey: ["public-events", "prizes"] });
      queryClient.invalidateQueries({
        queryKey: ["coordinator-events", "prizes"],
      });
      queryClient.invalidateQueries({ queryKey: ["participant-my-teams"] });
      queryClient.invalidateQueries({ queryKey: ["participant-team-detail"] });
      queryClient.invalidateQueries({ queryKey: ["pending-appeal-count"] });
    },
  });
};

export const useUpdateAppealMutation = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      disqualificationId,
      payload,
    }: {
      disqualificationId: UUID;
      payload: UpdateAppealRequest;
    }) => disqualificationApi.updateAppeal(disqualificationId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: disqualificationQueryKeys.all,
      });
      queryClient.invalidateQueries({ queryKey: ["pending-appeal-count"] });
    },
  });
};
