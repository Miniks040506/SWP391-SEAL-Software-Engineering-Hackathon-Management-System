package com.t7.seal.service.impl;

import com.t7.seal.entities.Ranking;
import com.t7.seal.repository.RankingRepository;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;
import com.t7.seal.response.submission.TeamDetailedScoreResponse;
import com.t7.seal.service.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RankingServiceImpl implements RankingService {

    private final RankingRepository rankingRepository;

    @Transactional(readOnly = true)
    @Override
    public List<RankingResponse> getRankings(UUID eventId, UUID trackId, UUID roundId) {
        return rankingRepository.getPublicRankings(eventId, trackId, roundId)
                .stream()
                .map(this::toRankingResponse)
                .toList();
    }

    @Override
    public List<RankingResponse> getCoordinatorRankings(
            UUID eventId,
            UUID trackId,
            UUID roundId,
            Authentication authentication
    ) {
        return List.of();
    }

    @Override
    public RankingRecalculationResponse calculateRoundRankings(UUID roundId, UUID trackId, Authentication authentication) {
        return null;
    }

    @Override
    public PublishResultsResponse publishEventResults(UUID eventId, PublishResultsRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public PublishResultsResponse publishRoundResults(UUID roundId, PublishResultsRequest request, Authentication authentication) {
        return null;
    }

    @Override
    public List<TeamDetailedScoreResponse> getPublishedTeamScores(UUID teamId, Authentication authentication) {
        return List.of();
    }

    @Override
    public TeamDetailedScoreResponse getPublishedTeamRoundScore(UUID teamId, UUID roundId, Authentication authentication) {
        return null;
    }

    @Override
    public TeamDetailedScoreResponse getPublishedSubmissionScore(UUID submissionId, Authentication authentication) {
        return null;
    }

    @Transactional(readOnly = true)
    @Override
    public List<TeamRankingHistoryResponse> getTeamRankingHistory(UUID teamId) {
        return rankingRepository.findPublicTeamHistory(teamId)
                .stream()
                .map(this::toTeamRankingHistoryResponse)
                .toList();
    }

    //HELPERS
    RankingResponse toRankingResponse(Ranking ranking) {
        return new RankingResponse(
                ranking.getId(),
                ranking.getSubmission().getId(),
                ranking.getSubmission().getTeam().getId(),
                ranking.getSubmission().getTeam().getName(),
                ranking.getRound().getId(),
                ranking.getTrack().getId(),
                ranking.getTotalScore(),
                ranking.getRankPosition(),
                ranking.getIsAdvanced()
        );
    }

    TeamRankingHistoryResponse toTeamRankingHistoryResponse(Ranking ranking) {
        return new TeamRankingHistoryResponse(
                ranking.getRound().getId(),
                ranking.getRound().getName(),
                ranking.getTrack().getId(),
                ranking.getTrack().getName(),
                ranking.getTotalScore(),
                ranking.getRankPosition(),
                ranking.getIsAdvanced()
        );
    }
}
