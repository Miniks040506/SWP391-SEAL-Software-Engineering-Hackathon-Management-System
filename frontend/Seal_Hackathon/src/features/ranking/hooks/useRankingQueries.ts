import { useQuery } from "@tanstack/react-query";
import { rankingApi } from "@/api/ranking.api";
import type { UUID } from "@/types/common.types";
import type { LeaderboardParams, RoundRankingParams } from "@/types/ranking.types";
import { mockRankingService } from "../mocks/ranking.mock";

const USE_MOCK = false;

export const rankingQueryKeys = {
    all: ["rankings"] as const,
    roundRankings: (roundId: UUID, params?: RoundRankingParams) =>
        [...rankingQueryKeys.all, "round", roundId, params] as const,
    eventRankings: (eventId: UUID, params?: LeaderboardParams) =>
        [...rankingQueryKeys.all, "event", eventId, params] as const,
    publicEventLeaderboard: (eventId: UUID, params?: LeaderboardParams) =>
        [...rankingQueryKeys.all, "public", "event", eventId, params] as const,
    publicTrackLeaderboard: (eventId: UUID, trackId: UUID, params?: Omit<LeaderboardParams, "trackId">) =>
        [...rankingQueryKeys.all, "public", "track", trackId, params] as const,
};

export const useRoundRankingsQuery = (roundId?: UUID, params?: RoundRankingParams) => {
    return useQuery({
        queryKey: rankingQueryKeys.roundRankings(roundId!, params),
        queryFn: () => USE_MOCK
            ? mockRankingService.getRoundRankings(roundId!, params)
            : rankingApi.getRoundRankings(roundId!, params),
        enabled: !!roundId,
    });
};

export const useEventRankingsQuery = (eventId?: UUID, params?: LeaderboardParams) => {
    return useQuery({
        queryKey: rankingQueryKeys.eventRankings(eventId!, params),
        queryFn: () => USE_MOCK
            ? mockRankingService.getEventRankings(eventId!, params)
            : rankingApi.getEventRankings(eventId!, params),
        enabled: !!eventId,
    });
};

export const usePublicEventLeaderboardQuery = (eventId?: UUID, params?: LeaderboardParams) => {
    return useQuery({
        queryKey: rankingQueryKeys.publicEventLeaderboard(eventId!, params),
        queryFn: () => USE_MOCK
            ? mockRankingService.getPublicEventLeaderboard(eventId!, params)
            : rankingApi.getPublicEventLeaderboard(eventId!, params),
        enabled: !!eventId,
    });
};

export const usePublicTrackLeaderboardQuery = (eventId?: UUID, trackId?: UUID, params?: Omit<LeaderboardParams, "trackId">) => {
    return useQuery({
        queryKey: rankingQueryKeys.publicTrackLeaderboard(eventId!, trackId!, params),
        queryFn: () => USE_MOCK
            ? mockRankingService.getPublicTrackLeaderboard(eventId!, trackId!, params)
            : rankingApi.getPublicTrackLeaderboard(eventId!, trackId!, params),
        enabled: !!eventId && !!trackId,
    });
};