package com.t7.seal.response.results;

import java.util.UUID;

public record TeamRankingHistoryResponse(
        UUID roundId, String roundName, UUID trackId,
        String trackName, Double totalScore, Integer rankPosition, Boolean advanced
) {}
