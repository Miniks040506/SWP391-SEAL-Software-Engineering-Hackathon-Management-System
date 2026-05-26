package com.t7.seal.service;

import com.t7.seal.response.round.RoundDetailResponse;
import com.t7.seal.response.round.RoundResponse;

import java.util.List;
import java.util.UUID;

public interface RoundService {
    List<RoundResponse> getRoundsByEvent(UUID eventId);

    RoundDetailResponse getRoundById(UUID roundId);
}
