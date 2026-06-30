package com.t7.seal.service;

import com.t7.seal.request.results.*;
import com.t7.seal.response.results.PrizeAssignmentResponse;
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

    PrizeResponse awardPrize(UUID prizeId,
                             AwardPrizeRequest request,
                             Authentication authentication);

    PrizeResponse clearPrize(UUID prizeId,
                             ClearPrizeAwardRequest request,
                             Authentication authentication);

    List<PrizeAssignmentResponse> assignPrizesFromRanking(UUID eventId,
                                                          AssignPrizesFromRankingRequest request,
                                                          Authentication authentication);

    List<PrizeResponse> getPublishedAwards(UUID eventId);
}
