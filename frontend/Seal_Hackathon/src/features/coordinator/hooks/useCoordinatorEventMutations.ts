import { useMutation, useQueryClient } from "@tanstack/react-query";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import { coordinatorEventKeys } from "@/features/coordinator/hooks/useCoordinatorEventQueries";

import { mockCoordinatorService } from "../mocks/coordinatorService.mock";
import type { UUID } from "@/types/common.types";
import type { CreateEventRequest, UpdateEventRequest } from "@/types/event.types";
import type { CreatePrizeRequest, UpdatePrizeRequest } from "@/types/prize.types";
import type {
  AssignJudgeRequest,
  CreateAdvanceRuleRequest,
  CreateRoundRequest,
  UpdateAdvanceRuleRequest,
  UpdateRoundRequest,
} from "@/types/round.types";
import type { AssignMentorRequest, CreateTrackRequest, UpdateTrackRequest } from "@/types/track.types";

const USE_MOCK = false;

const activeEventApi = USE_MOCK ? mockCoordinatorService.eventApi : eventApi;
const activeTrackApi = USE_MOCK ? mockCoordinatorService.trackApi : trackApi;
const activeRoundApi = (USE_MOCK ? mockCoordinatorService.roundApi : roundApi) as typeof roundApi;
const activePrizeApi = USE_MOCK ? mockCoordinatorService.prizeApi : prizeApi;

export function useCreateEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateEventRequest) => activeEventApi.createEvent(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.all }),
  });
}

export function useUpdateEventMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateEventRequest) => activeEventApi.updateEvent(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.all });
    },
  });
}

export function useDeleteEventMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (eventId: UUID) => activeEventApi.deleteEvent(eventId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.all }),
  });
}

export function useCreateTrackMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateTrackRequest) => activeTrackApi.createTrack(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.tracks(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
    },
  });
}

export function useUpdateTrackMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trackId, payload }: { trackId: UUID; payload: UpdateTrackRequest }) =>
      activeTrackApi.updateTrack(trackId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.tracks(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
    },
  });
}

export function useDeleteTrackMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (trackId: UUID) => activeTrackApi.deleteTrack(trackId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.tracks(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
    },
  });
}

export function useCreateRoundMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateRoundRequest) => activeRoundApi.createRound(eventId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
    },
  });
}

export function useUpdateRoundMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: UUID; payload: UpdateRoundRequest }) =>
      activeRoundApi.updateRound(roundId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
    },
  });
}

export function useDeleteRoundMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: UUID) => activeRoundApi.deleteRound(roundId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
    },
  });
}

export function useCreatePrizeMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreatePrizeRequest) => activePrizeApi.createPrize(payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.prizes(eventId) }),
  });
}

export function useUpdatePrizeMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ prizeId, payload }: { prizeId: UUID; payload: UpdatePrizeRequest }) =>
      activePrizeApi.updatePrize(prizeId, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.prizes(eventId) }),
  });
}

export function useDeletePrizeMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (prizeId: UUID) => activePrizeApi.deletePrize(prizeId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.prizes(eventId) }),
  });
}

export function useAssignMentorMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trackId, payload }: { trackId: UUID; payload: AssignMentorRequest }) =>
      activeTrackApi.assignMentor(trackId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.mentorAssignments(variables.trackId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.tracks(eventId) });
    },
  });
}

export function useRemoveMentorAssignmentMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ trackId, assignmentId }: { trackId: UUID; assignmentId: UUID }) =>
      activeTrackApi.removeMentorAssignment(trackId, assignmentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.mentorAssignments(variables.trackId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.tracks(eventId) });
    },
  });
}

export function useAssignJudgeMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: UUID; payload: AssignJudgeRequest }) =>
      activeRoundApi.assignJudge(roundId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.judgeAssignments(variables.roundId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
    },
  });
}

export function useRemoveJudgeAssignmentMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, assignmentId }: { roundId: UUID; assignmentId: UUID }) =>
      activeRoundApi.removeJudgeAssignment(roundId, assignmentId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.judgeAssignments(variables.roundId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
    },
  });
}

export function useOpenRoundMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: UUID) => activeRoundApi.openRound(roundId),
    onSuccess: (_data, roundId) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.roundOperationStatus(roundId) });
    },
  });
}

export function useCloseRoundMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: UUID) => activeRoundApi.closeRound(roundId),
    onSuccess: (_data, roundId) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.roundOperationStatus(roundId) });
    },
  });
}

export function useLockSubmissionsMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (roundId: UUID) => activeRoundApi.lockSubmissions(roundId),
    onSuccess: (_data, roundId) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.roundOperationStatus(roundId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.judgeAssignments(roundId) });
    },
  });
}

export function useCreateAdvanceRuleMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ roundId, payload }: { roundId: UUID; payload: CreateAdvanceRuleRequest }) =>
      activeRoundApi.createAdvanceRule(roundId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.advanceRules(variables.roundId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
    },
  });
}

export function useUpdateAdvanceRuleMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      ruleId,
      payload,
    }: {
      ruleId: UUID;
      roundId: UUID;
      payload: UpdateAdvanceRuleRequest;
    }) => activeRoundApi.updateAdvanceRule(ruleId, payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.advanceRules(variables.roundId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
    },
  });
}

export function useDeleteAdvanceRuleMutation(eventId: UUID) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ ruleId }: { ruleId: UUID; roundId: UUID }) =>
      activeRoundApi.deleteAdvanceRule(ruleId),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.advanceRules(variables.roundId) });
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) });
    },
  });
}
