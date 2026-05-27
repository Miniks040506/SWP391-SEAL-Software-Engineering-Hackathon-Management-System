package com.t7.seal.service;

import com.t7.seal.request.round.CreateRoundRequest;
import com.t7.seal.request.round.UpdateRoundRequest;
import com.t7.seal.response.round.RoundDetailResponse;
import com.t7.seal.response.round.RoundResponse;

import java.util.List;
import java.util.UUID;

public interface RoundService {
    RoundResponse createRound(UUID eventId, CreateRoundRequest request);

    List<RoundResponse> getRoundsByEvent(UUID eventId);

    RoundDetailResponse getRoundById(UUID roundId);

    RoundResponse updateRound(UUID roundId, UpdateRoundRequest request);

    void deleteRound(UUID roundId);
}
