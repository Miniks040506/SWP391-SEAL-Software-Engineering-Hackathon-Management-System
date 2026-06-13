import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useSnackbar } from "notistack";
import { mentorFeedbackApi } from "@/api/mentorFeedback.api";
import type { UUID } from "@/types/common.types";
import type {
  CreateMentorFeedbackRequest,
  UpdateMentorFeedbackRequest,
} from "@/types/mentorFeedback.types";
import {
  getMockFeedbacks,
  addMockFeedback,
  updateMockFeedback,
  deleteMockFeedback,
  publishMockFeedback,
} from "../mocks/mentorFeedback.mock";

const USE_MOCK = false;
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function useMentorFeedback(teamId?: UUID | string) {
  const queryClient = useQueryClient();
  const { enqueueSnackbar } = useSnackbar();

  const queryKey = ["mentor-team-feedback", teamId];

  // GET: Fetch list
  const feedbackListQuery = useQuery({
    queryKey,
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: getMockFeedbacks() };
      }
      return mentorFeedbackApi.getMentorTeamFeedback(teamId as UUID);
    },
    enabled: !!teamId,
  });

  // POST: Create
  const createMutation = useMutation({
    mutationFn: async (payload: CreateMentorFeedbackRequest) => {
      if (USE_MOCK) {
        await delay(500);
        return {
          data: addMockFeedback({
            ...payload,
            visibility: payload.publish ? "PUBLISHED" : "DRAFT",
          }),
        };
      }
      return mentorFeedbackApi.createFeedback(teamId as UUID, payload);
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey });
      const action = variables.publish ? "published" : "saved as draft";
      enqueueSnackbar(`Feedback successfully ${action}!`, {
        variant: "success",
      });
    },
    onError: () =>
      enqueueSnackbar("Failed to create feedback", { variant: "error" }),
  });

  // PATCH: Update
  const updateMutation = useMutation({
    mutationFn: async ({ id, payload }: { id: UUID; payload: UpdateMentorFeedbackRequest }) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: updateMockFeedback(id, payload) };
      }
      return mentorFeedbackApi.updateFeedback(id, payload);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      enqueueSnackbar("Feedback updated successfully!", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to update feedback", { variant: "error" }),
  });

  // POST: Publish
  const publishMutation = useMutation({
    mutationFn: async (id: UUID) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: publishMockFeedback(id) };
      }
      return mentorFeedbackApi.publishFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      enqueueSnackbar("Feedback published! Team has been notified.", { variant: "success" });
    },
    onError: () => enqueueSnackbar("Failed to publish feedback", { variant: "error" }),
  });

  // DELETE
  const deleteMutation = useMutation({
    mutationFn: async (id: UUID) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: deleteMockFeedback(id) };
      }
      return mentorFeedbackApi.deleteFeedback(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey });
      enqueueSnackbar("Feedback deleted", { variant: "info" });
    },
  });

  return {
    feedbackListQuery,
    createFeedback: createMutation.mutateAsync,
    updateFeedback: updateMutation.mutateAsync,
    publishFeedback: publishMutation.mutateAsync,
    deleteFeedback: deleteMutation.mutateAsync,
    isMutating: createMutation.isPending || updateMutation.isPending || publishMutation.isPending || deleteMutation.isPending,
  };
}
