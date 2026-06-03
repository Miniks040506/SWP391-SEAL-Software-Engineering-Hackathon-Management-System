import { useQueries, useQuery } from "@tanstack/react-query";

import { assignableUserApi } from "@/api/assignableUser.api";
import { eventApi } from "@/api/event.api";
import { prizeApi } from "@/api/prize.api";
import { roundApi } from "@/api/round.api";
import { trackApi } from "@/api/track.api";

import type { UUID } from "@/types/common.types";
import type { GetEventsParams } from "@/types/event.types";
import type { AssignableUserRole } from "@/types/user.types";

export const coordinatorEventKeys = {
  all: ["coordinator-events"] as const,

  list: (params?: GetEventsParams) =>
    [...coordinatorEventKeys.all, "list", params] as const,

  detail: (eventId?: UUID) =>
    [...coordinatorEventKeys.all, "detail", eventId] as const,

  tracks: (eventId?: UUID) =>
    [...coordinatorEventKeys.all, "tracks", eventId] as const,

  rounds: (eventId?: UUID) =>
    [...coordinatorEventKeys.all, "rounds", eventId] as const,

  prizes: (eventId?: UUID) =>
    [...coordinatorEventKeys.all, "prizes", eventId] as const,

  mentorAssignments: (trackId?: UUID) =>
    [...coordinatorEventKeys.all, "mentor-assignments", trackId] as const,

  judgeAssignments: (roundId?: UUID) =>
    [...coordinatorEventKeys.all, "judge-assignments", roundId] as const,

  assignableUsers: (role: AssignableUserRole, search?: string) =>
    [...coordinatorEventKeys.all, "assignable-users", role, search] as const,
};

export function useCoordinatorEventsQuery(params?: GetEventsParams) {
  return useQuery({
    queryKey: coordinatorEventKeys.list(params),
    queryFn: () => eventApi.getAllEvents(params),
  });
}

export function useCoordinatorEventDetailQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.detail(eventId),
    queryFn: () => eventApi.getEventById(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorEventTracksQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.tracks(eventId),
    queryFn: () => trackApi.getTracksByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorEventRoundsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.rounds(eventId),
    queryFn: () => roundApi.getRoundsByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorEventPrizesQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorEventKeys.prizes(eventId),
    queryFn: () => prizeApi.getPrizesByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useAssignableUsersQuery(
  role: AssignableUserRole,
  search?: string,
) {
  return useQuery({
    queryKey: coordinatorEventKeys.assignableUsers(role, search),
    queryFn: () => assignableUserApi.getAssignableUsers(role, search),
    staleTime: 30_000,
  });
}

export function useMentorAssignmentsQueries(trackIds: UUID[]) {
  return useQueries({
    queries: trackIds.map((trackId) => ({
      queryKey: coordinatorEventKeys.mentorAssignments(trackId),
      queryFn: () => trackApi.getMentorAssignments(trackId),
      enabled: Boolean(trackId),
    })),
  });
}

export function useJudgeAssignmentsQueries(roundIds: UUID[]) {
  return useQueries({
    queries: roundIds.map((roundId) => ({
      queryKey: coordinatorEventKeys.judgeAssignments(roundId),
      queryFn: () => roundApi.getJudgeAssignments(roundId),
      enabled: Boolean(roundId),
    })),
  });
}
