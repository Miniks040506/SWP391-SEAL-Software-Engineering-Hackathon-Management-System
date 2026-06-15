import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { mentorFeedbackApi } from "@/api/mentorFeedback.api";
import type { UUID } from "@/types/common.types";
import type { CreateMentorFeedbackRequest, UpdateMentorFeedbackRequest } from "@/types/mentorFeedback.types";
import {
  getMockFeedbacks,
  addMockFeedback,
  updateMockFeedback,
  deleteMockFeedback,
  publishMockFeedback,
} from "../mocks/mentorFeedback.mock";

const USE_MOCK = true;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const useSharedFeedbackMutations = () => {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const invalidateAll = () => {
    queryClient.invalidateQueries({ queryKey: ["mentor-all-feedback"] });
    queryClient.invalidateQueries({ queryKey: ["mentor-team-feedback"] });
  };

  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: UUID; payload: UpdateMentorFeedbackRequest }) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: updateMockFeedback(id, payload) };
      }
      return mentorFeedbackApi.updateFeedback(id, payload);
    },
    onSuccess: () => {
      invalidateAll();
      enqueueSnackbar("Feedback updated successfully!", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to update feedback", { variant: "error" }),
  });

  const publishMutation = useMutation({
    mutationFn: async (id: UUID) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: publishMockFeedback(id) };
      }
      return mentorFeedbackApi.publishFeedback(id);
    },
    onSuccess: () => {
      invalidateAll();
      enqueueSnackbar("Feedback published! Team has been notified.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to publish feedback", { variant: "error" }),
  });

  const deleteMutation = useMutation({
    mutationFn: async (id: UUID) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: deleteMockFeedback(id) };
      }
      return mentorFeedbackApi.deleteFeedback(id);
    },
    onSuccess: () => {
      invalidateAll();
      enqueueSnackbar("Feedback deleted", { variant: "info" });
    },
  });

  return {
    updateFeedback: updateMutation.mutateAsync,
    publishFeedback: publishMutation.mutateAsync,
    deleteFeedback: deleteMutation.mutateAsync,
    isUpdating: updateMutation.isPending || publishMutation.isPending || deleteMutation.isPending,
  };
};


export function useMentorFeedback(teamId?: UUID | string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();
  const sharedMutations = useSharedFeedbackMutations();

  const feedbackListQuery = useQuery({
    queryKey: ["mentor-team-feedback", teamId],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: getMockFeedbacks().filter((fb) => fb.teamId === teamId) };
      }
      return mentorFeedbackApi.getMentorTeamFeedback(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });

  const createMutation = useMutation({
    mutationFn: async (payload: CreateMentorFeedbackRequest) => {
      const targetTeamId = payload.teamId || teamId;
      if (USE_MOCK) {
        await delay(500);
        return {
          data: addMockFeedback({
            ...payload,
            teamId: targetTeamId as UUID,
            visibility: payload.publish ? "PUBLISHED" : "DRAFT",
          }),
        };
      }
      return mentorFeedbackApi.createFeedback(targetTeamId as UUID, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["mentor-all-feedback"] });
      queryClient.invalidateQueries({ queryKey: ["mentor-team-feedback"] });
      const action = variables.publish ? "published" : "saved as draft";
      enqueueSnackbar(`Feedback successfully ${action}!`, { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to create feedback", { variant: "error" }),
  });

  return {
    feedbackListQuery,
    createFeedback: createMutation.mutateAsync,
    updateFeedback: sharedMutations.updateFeedback,
    publishFeedback: sharedMutations.publishFeedback,
    deleteFeedback: sharedMutations.deleteFeedback,
    isMutating: createMutation.isPending || sharedMutations.isUpdating,
  };
}

export function useMentorGlobalFeedback() {
  const sharedMutations = useSharedFeedbackMutations();

  const feedbackListQuery = useQuery({
    queryKey: ["mentor-all-feedback"],
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: getMockFeedbacks() };
      }
      return { data: [] }; 
    },
  });

  return {
    feedbackListQuery,
    updateFeedback: sharedMutations.updateFeedback,
    publishFeedback: sharedMutations.publishFeedback,
    deleteFeedback: sharedMutations.deleteFeedback,
    isMutating: sharedMutations.isUpdating,
  };
}