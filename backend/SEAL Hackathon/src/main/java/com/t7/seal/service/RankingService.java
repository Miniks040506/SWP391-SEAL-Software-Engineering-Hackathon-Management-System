package com.t7.seal.service;

import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;

import java.util.List;
import java.util.UUID;

public interface RankingService {
    List<RankingResponse> getRankings(UUID eventId, UUID trackId, UUID roundId);

    List<TeamRankingHistoryResponse> getTeamRankingHistory(UUID teamId);
}
