import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  GetRankingsParams,
  LeaderboardParams,
  PublishResultsRequest,
  PublishResultsResponse,
  RankingCalculationParams,
  RankingRecalculationResponse,
  RankingResponse,
  RecalculateRankingRequest,
  RoundRankingParams,
  TeamRankingHistoryResponse,
} from "@/types/ranking.types";

export const rankingApi = {
  getRankings(params?: GetRankingsParams) {
    return apiRequest.get<RankingResponse[]>("/rankings", {params});
  },

  recalculateRanking(payload: RecalculateRankingRequest) {
    return apiRequest.post<RankingRecalculationResponse>(
      "/rankings/recalculate",
      payload,
    );
  },

  calculateRoundRankings(roundId: UUID, params?: RankingCalculationParams) {
    return apiRequest.post<RankingRecalculationResponse>(
      `/rounds/${roundId}/rankings/calculate`,
      undefined,
      {params},
    );
  },

  approveTie(roundId: UUID, rankingId: UUID) {
    return apiRequest.post<void>(
      `/rounds/${roundId}/rankings/${rankingId}/approve-tie`,
    );
  },

  getRoundRankings(roundId: UUID, params?: RoundRankingParams) {
    return apiRequest.get<RankingResponse[]>(`/rounds/${roundId}/rankings`, {
      params,
    });
  },

  getEventRankings(eventId: UUID, params?: LeaderboardParams) {
    return apiRequest.get<RankingResponse[]>(`/events/${eventId}/rankings`, {
      params,
    });
  },

  getTrackRankings(trackId: UUID, params?: Omit<LeaderboardParams, "trackId">) {
    return apiRequest.get<RankingResponse[]>(`/tracks/${trackId}/rankings`, {
      params,
    });
  },

  getPublicEventLeaderboard(eventId: UUID, params?: LeaderboardParams) {
    return apiRequest.get<RankingResponse[]>(
      `/public/events/${eventId}/leaderboard`,
      {params},
    );
  },

  getPublicTrackLeaderboard(eventId: UUID, trackId: UUID, params?: Omit<LeaderboardParams, "trackId">) {
    return apiRequest.get<RankingResponse[]>(
      `/public/events/${eventId}/tracks/${trackId}/leaderboard`,
      {params},
    );
  },

  getCoordinatorEventResults(eventId: UUID, params?: LeaderboardParams) {
    return apiRequest.get<RankingResponse[]>(`/events/${eventId}/results`, {
      params,
    });
  },

  getCoordinatorRoundResults(roundId: UUID, params?: RoundRankingParams) {
    return apiRequest.get<RankingResponse[]>(`/rounds/${roundId}/results`, {
      params,
    });
  },

  publishEventResults(eventId: UUID, payload?: PublishResultsRequest) {
    return apiRequest.post<PublishResultsResponse>(
      `/events/${eventId}/results/publish`,
      payload ?? {},
    );
  },

  publishRoundResults(roundId: UUID, payload?: PublishResultsRequest) {
    return apiRequest.post<PublishResultsResponse>(
      `/rounds/${roundId}/results/publish`,
      payload ?? {},
    );
  },

  getTeamRankingHistory(teamId: UUID) {
    return apiRequest.get<TeamRankingHistoryResponse[]>(
      `/rankings/teams/${teamId}`,
    );
  },
};
