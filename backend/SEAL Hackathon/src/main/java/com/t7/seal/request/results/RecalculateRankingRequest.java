package com.t7.seal.request.results;

import jakarta.validation.constraints.NotNull;

import java.util.UUID;

public record RecalculateRankingRequest(
        @NotNull UUID roundId, UUID trackId
) {}
