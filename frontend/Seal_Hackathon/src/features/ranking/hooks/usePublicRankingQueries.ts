import { useQueries, useQuery } from "@tanstack/react-query";
import { rankingApi } from "@/api/ranking.api";
import type { UUID } from "@/types/common.types";
import type { EventSummaryResponse } from "@/types/event.types";
import { mockRankingService } from "../mocks/ranking.mock";

const USE_MOCK = false;

export const publicRankingKeys = {
  all: ["public-rankings"] as const,

  list: (params?: { eventId?: UUID; roundId?: UUID; trackId?: UUID }) =>
    [...publicRankingKeys.all, "list", params] as const,
};

export function usePublicEventRankingQuery(params?: {
  eventId?: UUID;
  roundId?: UUID | null;
  trackId?: UUID | null;
}) {
  const normalizedParams = {
    eventId: params?.eventId,
    roundId: params?.roundId || undefined,
    trackId: params?.trackId || undefined,
  };

  return useQuery({
    queryKey: publicRankingKeys.list(normalizedParams),
    queryFn: () =>
      USE_MOCK
        ? mockRankingService.getRankings(normalizedParams)
        : rankingApi.getRankings(normalizedParams),
    enabled: Boolean(params?.eventId),
  });
}

export function usePublicCompletedEventRankingsQueries(
  events: EventSummaryResponse[],
) {
  return useQueries({
    queries: events.map((event) => ({
      queryKey: publicRankingKeys.list({ eventId: event.id }),
      queryFn: () =>
        USE_MOCK
          ? mockRankingService.getRankings({ eventId: event.id })
          : rankingApi.getRankings({ eventId: event.id }),
      enabled: Boolean(event.id),
    })),
  });
}
