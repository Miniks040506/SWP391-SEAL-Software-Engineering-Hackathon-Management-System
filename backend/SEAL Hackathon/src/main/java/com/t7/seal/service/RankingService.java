package com.t7.seal.service;

import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;
import com.t7.seal.response.submission.TeamDetailedScoreResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface RankingService {
    List<RankingResponse> getRankings(UUID eventId, UUID trackId, UUID roundId);

    List<RankingResponse> getCoordinatorRankings(UUID eventId, UUID trackId,
                                                 UUID roundId,
                                                 Authentication authentication);

    RankingRecalculationResponse calculateRoundRankings(UUID roundId, UUID trackId,
                                                        Authentication authentication);

    PublishResultsResponse publishEventResults(UUID eventId,
                                               PublishResultsRequest request,
                                               Authentication authentication);

    PublishResultsResponse publishRoundResults(UUID roundId,
                                               PublishResultsRequest request,
                                               Authentication authentication);

    List<TeamDetailedScoreResponse> getPublishedTeamScores(UUID teamId,
                                                           Authentication authentication);

    TeamDetailedScoreResponse getPublishedTeamRoundScore(UUID teamId, UUID roundId,
                                                         Authentication authentication);

    TeamDetailedScoreResponse getPublishedSubmissionScore(UUID submissionId,
                                                          Authentication authentication);

    List<TeamRankingHistoryResponse> getTeamRankingHistory(UUID teamId);
}
