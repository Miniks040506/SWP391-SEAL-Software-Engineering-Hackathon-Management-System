package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.RecalculateRankingRequest;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/rankings")
public class RankingController {
    @GetMapping
    public ResponseEntity<List<RankingResponse>> getRankings(
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) UUID roundId,
            @RequestParam(required = false) UUID trackId
    ) {
        return null;
    }

    @PostMapping("/recalculate")
    public ResponseEntity<RankingRecalculationResponse> recalculateRanking(
            @Valid @RequestBody RecalculateRankingRequest request
    ) {
        return null;
    }

    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<TeamRankingHistoryResponse>> getTeamRankingHistory(
            @PathVariable("teamId") UUID teamId
    ) {
        return null;
    }
}
