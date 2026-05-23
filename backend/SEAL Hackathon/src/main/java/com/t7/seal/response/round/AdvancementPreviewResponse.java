package com.t7.seal.response.round;

import com.t7.seal.response.results.RankingResponse;

import java.util.List;
import java.util.UUID;

public record AdvancementPreviewResponse(
        UUID roundId,
        List<RankingResponse> suggestedAdvancedTeams,
        List<String> warnings
) {}
