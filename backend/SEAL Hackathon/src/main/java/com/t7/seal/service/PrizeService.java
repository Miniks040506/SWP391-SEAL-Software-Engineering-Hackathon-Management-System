package com.t7.seal.service;

import com.t7.seal.request.results.CreatePrizeRequest;
import com.t7.seal.request.results.UpdatePrizeRequest;
import com.t7.seal.response.results.PrizeResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface PrizeService {
    PrizeResponse createPrize(CreatePrizeRequest request, Authentication authentication);

    PrizeResponse updatePrize(UUID prizeId, UpdatePrizeRequest request, Authentication authentication);

    void deletePrize(UUID prizeId, Authentication authentication);

    List<PrizeResponse> getPrizesByEvent(UUID eventId);

    PrizeResponse getPrizeById(UUID prizeId);
}
