package com.t7.seal.service;

import com.t7.seal.response.results.PrizeResponse;

import java.util.List;
import java.util.UUID;

public interface PrizeService {
    List<PrizeResponse> getPrizesByEvent(UUID eventId);

    PrizeResponse getPrizeById(UUID prizeId);
}
