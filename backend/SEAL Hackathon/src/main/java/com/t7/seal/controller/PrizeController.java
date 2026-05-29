package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.AwardPrizeRequest;
import com.t7.seal.request.results.ClearPrizeAwardRequest;
import com.t7.seal.request.results.CreatePrizeRequest;
import com.t7.seal.request.results.UpdatePrizeRequest;
import com.t7.seal.response.results.PrizeResponse;
import com.t7.seal.service.PrizeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/prizes")
public class PrizeController {

    private final PrizeService prizeService;

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PostMapping
    public ResponseEntity<PrizeResponse> createPrize(
            @Valid @RequestBody CreatePrizeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prizeService.createPrize(request, authentication));
    }

    @GetMapping("/events/{eventId}")
    public ResponseEntity<List<PrizeResponse>> getPrizesByEvent(
            @PathVariable("eventId") UUID eventId
    ) {
        return ResponseEntity.ok(prizeService.getPrizesByEvent(eventId));
    }

    @GetMapping("/{prizeId}")
    public ResponseEntity<PrizeResponse> getPrizeById(
            @PathVariable("prizeId") UUID prizeId
    ) {
        return ResponseEntity.ok(prizeService.getPrizeById(prizeId));
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PatchMapping("/{prizeId}")
    public ResponseEntity<PrizeResponse> updatePrize(
            @PathVariable("prizeId") UUID prizeId,
            @Valid @RequestBody UpdatePrizeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(prizeService.updatePrize(prizeId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @DeleteMapping("/{prizeId}")
    public ResponseEntity<Void> deletePrize(
            @PathVariable("prizeId") UUID prizeId,
            @RequestParam("eventId") UUID eventId,
            @RequestParam("trackId") UUID trackId,
            Authentication authentication
    ) {
        prizeService.deletePrize(prizeId, eventId, trackId, authentication);
        return ResponseEntity.noContent().build();
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
