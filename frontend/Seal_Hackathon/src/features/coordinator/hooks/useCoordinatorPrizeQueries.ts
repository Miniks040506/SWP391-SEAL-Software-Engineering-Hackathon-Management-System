import { useQuery } from "@tanstack/react-query";
import { prizeApi } from "@/api/prize.api";
import type { UUID } from "@/types/common.types";

export const coordinatorPrizeKeys = {
  all: ["coordinator-prizes"] as const,
  lists: () => [...coordinatorPrizeKeys.all, "list"] as const,
  list: (eventId: UUID) => [...coordinatorPrizeKeys.lists(), { eventId }] as const,
  details: () => [...coordinatorPrizeKeys.all, "detail"] as const,
  detail: (id: UUID) => [...coordinatorPrizeKeys.details(), id] as const,
  awards: () => [...coordinatorPrizeKeys.all, "awards"] as const,
  awardList: (eventId: UUID) => [...coordinatorPrizeKeys.awards(), { eventId }] as const,
};

export function useCoordinatorPrizesQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorPrizeKeys.list(eventId!),
    queryFn: () => prizeApi.getPrizesByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorPrizeDetailQuery(prizeId?: UUID) {
  return useQuery({
    queryKey: coordinatorPrizeKeys.detail(prizeId!),
    queryFn: () => prizeApi.getPrizeById(prizeId!),
    enabled: Boolean(prizeId),
  });
}

export function useCoordinatorPublishedAwardsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorPrizeKeys.awardList(eventId!),
    queryFn: () => prizeApi.getPublishedAwards(eventId!),
    enabled: Boolean(eventId),
  });
}
