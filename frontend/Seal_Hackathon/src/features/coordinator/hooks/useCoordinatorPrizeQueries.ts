import { useQuery } from "@tanstack/react-query";
import { prizeApi } from "@/api/prize.api";
import { mockCoordinatorService } from "../mocks/coordinatorService.mock";
import type { UUID } from "@/types/common.types";

const USE_MOCK = false;
const activePrizeApi: typeof prizeApi = USE_MOCK
  ? mockCoordinatorService.prizeApi as unknown as typeof prizeApi
  : prizeApi;

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
    queryFn: () => activePrizeApi.getPrizesByEvent(eventId!),
    enabled: Boolean(eventId),
  });
}

export function useCoordinatorPrizeDetailQuery(prizeId?: UUID) {
  return useQuery({
    queryKey: coordinatorPrizeKeys.detail(prizeId!),
    queryFn: () => activePrizeApi.getPrizeById(prizeId!),
    enabled: Boolean(prizeId),
  });
}

export function useCoordinatorPublishedAwardsQuery(eventId?: UUID) {
  return useQuery({
    queryKey: coordinatorPrizeKeys.awardList(eventId!),
    queryFn: () => activePrizeApi.getPublishedAwards(eventId!),
    enabled: Boolean(eventId),
  });
}
