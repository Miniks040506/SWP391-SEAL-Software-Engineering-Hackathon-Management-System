package com.t7.seal.controller;


import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.service.RankingService;
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
public class ResultRankingController {

    private final RankingService rankingService;

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/rankings/calculate")
    public ResponseEntity<RankingRecalculationResponse> calculateRoundRankings(
            @PathVariable UUID roundId,
            @RequestParam(required = false) UUID trackId,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @PostMapping("/events/{eventId}/results/publish")
    public ResponseEntity<PublishResultsResponse> publishEventResults(
            @PathVariable UUID eventId,
            @Valid @RequestBody(required = false) PublishResultsRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @PostMapping("/rounds/{roundId}/results/publish")
    public ResponseEntity<PublishResultsResponse> publishRoundResults(
            @PathVariable UUID roundId,
            @Valid @RequestBody(required = false) PublishResultsRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/rankings")
    public ResponseEntity<List<RankingResponse>> getPublishedRoundRankings(
            @PathVariable UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(null, trackId, roundId));
    }

    @GetMapping("/events/{eventId}/rankings")
    public ResponseEntity<List<RankingResponse>> getPublishedEventRankings(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @GetMapping("/tracks/{trackId}/rankings")
    public ResponseEntity<List<RankingResponse>> getPublishedTrackRankings(
            @PathVariable UUID trackId,
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) UUID roundId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @GetMapping("/public/events/{eventId}/leaderboard")
    public ResponseEntity<List<RankingResponse>> getPublicEventLeaderboard(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @GetMapping("/public/events/{eventId}/tracks/{trackId}/leaderboard")
    public ResponseEntity<List<RankingResponse>> getPublicTrackLeaderboard(
            @PathVariable UUID eventId,
            @PathVariable UUID trackId,
            @RequestParam(required = false) UUID roundId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @GetMapping("/events/{eventId}/results")
    public ResponseEntity<List<RankingResponse>> getCoordinatorEventResults(
            @PathVariable UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @GetMapping("/rounds/{roundId}/results")
    public ResponseEntity<List<RankingResponse>> getCoordinatorRoundResults(
            @PathVariable UUID roundId,
            @RequestParam(required = false) UUID trackId,
            Authentication authentication
    ) {
        return null;
    }
}
