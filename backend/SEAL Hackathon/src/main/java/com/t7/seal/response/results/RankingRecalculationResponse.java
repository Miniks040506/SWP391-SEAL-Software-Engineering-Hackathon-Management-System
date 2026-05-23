package com.t7.seal.response.results;

import java.time.LocalDateTime;
import java.util.UUID;

public record RankingRecalculationResponse(
        UUID roundId, UUID trackId,
        int rankingCount, LocalDateTime calculatedAt
) {}
