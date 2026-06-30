import { useQuery } from "@tanstack/react-query";
import { rankingApi } from "@/api/ranking.api";
import type { UUID } from "@/types/common.types";
import type {
  LeaderboardParams,
  RankingResponse,
  RoundRankingParams,
} from "@/types/ranking.types";

export const rankingQueryKeys = {
  all: ["rankings"] as const,
  roundRankings: (roundId: UUID, params?: RoundRankingParams) =>
    [...rankingQueryKeys.all, "round", roundId, params] as const,
  eventRankings: (eventId: UUID, params?: LeaderboardParams) =>
    [...rankingQueryKeys.all, "event", eventId, params] as const,
  publicEventLeaderboard: (eventId: UUID, params?: LeaderboardParams) =>
    [...rankingQueryKeys.all, "public", "event", eventId, params] as const,
  publicTrackLeaderboard: (
    eventId: UUID,
    trackId: UUID,
    params?: Omit<LeaderboardParams, "trackId">,
  ) =>
    [
      ...rankingQueryKeys.all,
      "public",
      "event",
      eventId,
      "track",
      trackId,
      params,
    ] as const,
};

export const useRoundRankingsQuery = (
  roundId?: UUID,
  params?: RoundRankingParams,
) => {
  return useQuery<RankingResponse[]>({
    queryKey: rankingQueryKeys.roundRankings(roundId!, params),
    queryFn: () => rankingApi.getRoundRankings(roundId!, params),
    enabled: !!roundId,
  });
};

export const useEventRankingsQuery = (
  eventId?: UUID,
  params?: LeaderboardParams,
) => {
  return useQuery<RankingResponse[]>({
    queryKey: rankingQueryKeys.eventRankings(eventId!, params),
    queryFn: () => rankingApi.getEventRankings(eventId!, params),
    enabled: !!eventId,
  });
};

export const usePublicEventLeaderboardQuery = (
  eventId?: UUID,
  params?: LeaderboardParams,
) => {
  return useQuery<RankingResponse[]>({
    queryKey: rankingQueryKeys.publicEventLeaderboard(eventId!, params),
    queryFn: () => rankingApi.getPublicEventLeaderboard(eventId!, params),
    enabled: !!eventId,
  });
};

export const usePublicTrackLeaderboardQuery = (
  eventId?: UUID,
  trackId?: UUID,
  params?: Omit<LeaderboardParams, "trackId">,
) => {
  return useQuery<RankingResponse[]>({
    queryKey: rankingQueryKeys.publicTrackLeaderboard(
      eventId!,
      trackId!,
      params,
    ),
    queryFn: () =>
      rankingApi.getPublicTrackLeaderboard(eventId!, trackId!, params),
    enabled: !!eventId && !!trackId,
  });
};
