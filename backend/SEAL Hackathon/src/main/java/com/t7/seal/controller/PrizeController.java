package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.AwardPrizeRequest;
import com.t7.seal.request.results.ClearPrizeAwardRequest;
import com.t7.seal.request.results.CreatePrizeRequest;
import com.t7.seal.request.results.UpdatePrizeRequest;
import com.t7.seal.response.results.PrizeResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/prizes")
public class PrizeController {
    @PostMapping
    public ResponseEntity<PrizeResponse> createPrize(
            @Valid @RequestBody CreatePrizeRequest request
    ) {
        return null;
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<List<PrizeResponse>> getPrizesByEvent(
            @PathVariable("eventId") UUID eventId
    ) {
        return null;
    }

    @GetMapping("/{prizeId}")
    public ResponseEntity<PrizeResponse> getPrizeById(
            @PathVariable("prizeId") UUID prizeId
    ) {
        return null;
    }

    @PatchMapping("/{prizeId}")
    public ResponseEntity<PrizeResponse> updatePrize(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody UpdatePrizeRequest request
    ) {
        return null;
    }

    @DeleteMapping("/{prizeId}")
    public ResponseEntity<Void> deletePrize(
            @PathVariable("prizeId") UUID prizeId
    ) {
        return null;
    }

    @PostMapping("/{prizeId}/award")
    public ResponseEntity<PrizeResponse> awardPrize(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody AwardPrizeRequest request
    ) {
        return null;
    }

    @PostMapping("/{prizeId}/clear-award")
    public ResponseEntity<PrizeResponse> clearAward(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody ClearPrizeAwardRequest request
    ) {
        return null;
    }
}
