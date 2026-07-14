import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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

export const MENTOR_FEEDBACK_KEYS = {
  all: ["mentor-feedback"] as const,
  global: () => [...MENTOR_FEEDBACK_KEYS.all, "global"] as const,
  team: (teamId?: string) => [...MENTOR_FEEDBACK_KEYS.all, "team", teamId] as const,
};

export function useMentorGlobalFeedbackQuery() {
  return useQuery({
    queryKey: MENTOR_FEEDBACK_KEYS.global(),
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return getMockFeedbacks();
      }
      // The global list endpoint is not available — return empty so callers handle gracefully
      return [] as any[];
    },
  });
}


export function useMentorTeamFeedbackQuery(teamId?: string) {
  return useQuery({
    queryKey: MENTOR_FEEDBACK_KEYS.team(teamId),
    queryFn: async () => {
      if (USE_MOCK) {
        await delay(500);
        return { data: getMockFeedbacks().filter((fb) => fb.teamId === teamId) };
      }
      return mentorFeedbackApi.getMentorTeamFeedback(teamId as UUID);
    },
    enabled: Boolean(teamId),
  });
}

export function useCreateMentorFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ teamId, payload }: { teamId: UUID; payload: CreateMentorFeedbackRequest }) => {
      if (USE_MOCK) {
        await delay(500);
        return {
          data: addMockFeedback({
            ...payload,
            teamId,
            visibility: payload.publish ? "PUBLISHED" : "DRAFT",
          }),
        };
      }
      return mentorFeedbackApi.createFeedback(teamId, payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MENTOR_FEEDBACK_KEYS.all }),
  });
}

export function useUpdateMentorFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, payload }: { id: UUID; payload: UpdateMentorFeedbackRequest }) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: updateMockFeedback(id, payload) };
      }
      return mentorFeedbackApi.updateFeedback(id, payload);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MENTOR_FEEDBACK_KEYS.all }),
  });
}

export function usePublishMentorFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: UUID) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: publishMockFeedback(id) };
      }
      return mentorFeedbackApi.publishFeedback(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MENTOR_FEEDBACK_KEYS.all }),
  });
}

export function useDeleteMentorFeedbackMutation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: UUID) => {
      if (USE_MOCK) {
        await delay(500);
        return { data: deleteMockFeedback(id) };
      }
      return mentorFeedbackApi.deleteFeedback(id);
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: MENTOR_FEEDBACK_KEYS.all }),
  });
}