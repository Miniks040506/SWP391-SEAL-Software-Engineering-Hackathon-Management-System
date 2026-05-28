import { apiRequest } from "@/api/apiRequest";
import type { UUID } from "@/types/common.types";
import type {
  GetRankingsParams,
  RankingRecalculationResponse,
  RankingResponse,
  RecalculateRankingRequest,
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

  getTeamRankingHistory(teamId: UUID) {
    return apiRequest.get<TeamRankingHistoryResponse[]>(
      `/rankings/teams/${teamId}`,
    );
  },
};
