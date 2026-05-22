package com.t7.seal.response.results;

import java.util.UUID;

public record RankingResponse(
        UUID id, UUID submissionId,
        UUID teamId, String teamName,
        UUID roundId, UUID trackId,
        Double totalScore,
        Integer rankPosition,
        Boolean advanced
) {}
