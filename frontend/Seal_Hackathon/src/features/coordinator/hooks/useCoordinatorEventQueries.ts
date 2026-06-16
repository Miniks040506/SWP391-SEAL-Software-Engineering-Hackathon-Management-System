import { useQueries, useQuery, useQueryClient } from "@tanstack/react-query";
import { useCallback } from "react";

import { assignableUserApi } from "@/api/assignableUser.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";
import { mockCoordinatorService } from "../mocks/coordinatorService.mock";

import type { UUID } from "@/types/common.types";
import type { GetEventsParams } from "@/types/event.types";
import type { AssignableUserRole } from "@/types/user.types";

const USE_MOCK = true;

const activeEventApi = USE_MOCK ? mockCoordinatorService.eventApi as any : eventApi;
const activeTrackApi = USE_MOCK ? mockCoordinatorService.trackApi as any : trackApi;
const activeRoundApi = USE_MOCK ? mockCoordinatorService.roundApi as any : roundApi;
const activePrizeApi = USE_MOCK ? mockCoordinatorService.prizeApi as any : prizeApi;
const activeUserApi = USE_MOCK ? mockCoordinatorService.assignableUserApi as any : assignableUserApi;

export const coordinatorEventKeys = {
  all: ["coordinator-events"] as const,
  list: (params?: GetEventsParams) => [...coordinatorEventKeys.all, "list", params] as const,
  detail: (eventId?: UUID) => [...coordinatorEventKeys.all, "detail", eventId] as const,
  tracks: (eventId?: UUID) => [...coordinatorEventKeys.all, "tracks", eventId] as const,
  rounds: (eventId?: UUID) => [...coordinatorEventKeys.all, "rounds", eventId] as const,
  prizes: (eventId?: UUID) => [...coordinatorEventKeys.all, "prizes", eventId] as const,
  mentorAssignments: (trackId?: UUID) => [...coordinatorEventKeys.all, "mentor-assignments", trackId] as const,
  judgeAssignments: (roundId?: UUID) => [...coordinatorEventKeys.all, "judge-assignments", roundId] as const,
  assignableUsers: (role: AssignableUserRole, search?: string) => [...coordinatorEventKeys.all, "assignable-users", role, search] as const,
};


export function useCoordinatorEventsQuery(params?: GetEventsParams) {
  return useQuery({
    queryKey: coordinatorEventKeys.list(params),
    queryFn: () => activeEventApi.getAllEvents(params),
  });
}

export function useCoordinatorEventDetailQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.detail(eventId),
    queryFn: () => activeEventApi.getEventById(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorEventTracksQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.tracks(eventId),
    queryFn: () => activeTrackApi.getTracksByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorEventRoundsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.rounds(eventId),
    queryFn: () => activeRoundApi.getRoundsByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorEventPrizesQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.prizes(eventId),
    queryFn: () => activePrizeApi.getPrizesByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useAssignableUsersQuery(role: AssignableUserRole, search?: string) {
  return useQuery({
    queryKey: coordinatorEventKeys.assignableUsers(role, search),
    queryFn: () => activeUserApi.getAssignableUsers(role, search),
    staleTime: 30_000,
  });
}

export function useMentorAssignmentsQueries(trackIds: UUID[]) {
  return useQueries({
    queries: trackIds.map((trackId) => ({
      queryKey: coordinatorEventKeys.mentorAssignments(trackId),
      queryFn: () => activeTrackApi.getMentorAssignments(trackId),
      enabled: Boolean(trackId),
      retry: false,
    })),
  });
}

export function useJudgeAssignmentsQueries(roundIds: UUID[]) {
  return useQueries({
    queries: roundIds.map((roundId) => ({
      queryKey: coordinatorEventKeys.judgeAssignments(roundId),
      queryFn: () => activeRoundApi.getJudgeAssignments(roundId),
      enabled: Boolean(roundId),
      retry: false,
    })),
  });
}

export function useInvalidateEditEventData(eventId?: UUID) {
  const queryClient = useQueryClient();
  return useCallback(async () => {
    if (!eventId) return;
    await Promise.all([
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.detail(eventId) }),
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.tracks(eventId) }),
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.rounds(eventId) }),
      queryClient.invalidateQueries({ queryKey: coordinatorEventKeys.prizes(eventId) }),
      queryClient.invalidateQueries({ queryKey: ["event-criteria", eventId] }),
    ]);
  }, [queryClient, eventId]);
}