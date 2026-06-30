package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.AssignPrizesFromRankingRequest;
import com.t7.seal.request.results.AwardPrizeRequest;
import com.t7.seal.request.results.ClearPrizeAwardRequest;
import com.t7.seal.response.grading.AssignedSubmissionResponse;
import com.t7.seal.response.results.PrizeAssignmentResponse;
import com.t7.seal.response.results.PrizeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class EventAwardController {

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PostMapping("/prizes/{prizeId}/award")
    public ResponseEntity<PrizeResponse> awardPrize(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody AwardPrizeRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PostMapping("/prizes/{prizeId}/clear-award")
    public ResponseEntity<PrizeResponse> clearAward(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody ClearPrizeAwardRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PatchMapping("/prizes/{prizeId}/winner")
    public ResponseEntity<PrizeResponse> updatePrizeWinner(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody AwardPrizeRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PostMapping("/events/{eventId}/prizes/assign-from-ranking")
    public ResponseEntity<PrizeAssignmentResponse> assignPrizesFromRanking(
            @PathVariable("eventId") UUID eventId,
            @Valid @RequestBody(required = false) AssignPrizesFromRankingRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @GetMapping("events/{eventId}/awards")
    public ResponseEntity<List<PrizeResponse>> getPublishedAwards(
            @PathVariable("eventId") UUID eventId
    ) {
        return null;
    }
}
