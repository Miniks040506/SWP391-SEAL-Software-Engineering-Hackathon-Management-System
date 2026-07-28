package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.PublishResultsRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.results.PublishResultsResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import com.t7.seal.service.RankingService;
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
@Tag(
        name = "Results and Rankings",
        description = "Ranking calculation, leaderboards, advancement, and result publication."
)
public class ResultRankingController {

    private final RankingService rankingService;

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Calculate Round Rankings",
            description = "Calculate Round Rankings through POST /api/v1/rounds/{roundId}/rankings/calculate. Successful execution returns HTTP 200 with RankingRecalculationResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/rankings/calculate; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "resultRankingCalculateRoundRankings",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Calculate round rankings completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/rounds/{roundId}/rankings/calculate")
    public ResponseEntity<RankingRecalculationResponse> calculateRoundRankings(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.calculateRoundRankings(roundId, trackId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Approve Ranking Tie",
            description = "Acknowledges manual review for a tied ranking group so results can be published.",
            operationId = "resultRankingApproveTie",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @PostMapping("/rounds/{roundId}/rankings/{rankingId}/approve-tie")
    public ResponseEntity<Void> approveTie(
            @PathVariable UUID roundId,
            @PathVariable UUID rankingId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        rankingService.approveTie(roundId, rankingId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @Operation(
            summary = "Publish Event Results",
            description = "Publish Event Results through POST /api/v1/events/{eventId}/results/publish. Successful execution returns HTTP 200 with PublishResultsResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/results/publish; @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\"). Optionally accepts a PublishResultsRequest request body validated with Jakarta Bean Validation.",
            operationId = "resultRankingPublishEventResults",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Publish event results completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/events/{eventId}/results/publish")
    public ResponseEntity<PublishResultsResponse> publishEventResults(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Valid @RequestBody(required = false) PublishResultsRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.publishEventResults(eventId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Publish Round Results",
            description = "Publish Round Results through POST /api/v1/rounds/{roundId}/results/publish. Successful execution returns HTTP 200 with PublishResultsResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/results/publish; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\"). Optionally accepts a PublishResultsRequest request body validated with Jakarta Bean Validation.",
            operationId = "resultRankingPublishRoundResults",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Publish round results completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "409",
                    description = "The operation conflicts with the current resource or workflow state.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @PostMapping("/rounds/{roundId}/results/publish")
    public ResponseEntity<PublishResultsResponse> publishRoundResults(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Valid @RequestBody(required = false) PublishResultsRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.publishRoundResults(roundId, request, authentication));
    }

    @Operation(
            summary = "Get Published Round Rankings",
            description = "Get Published Round Rankings through GET /api/v1/rounds/{roundId}/rankings. Successful execution returns HTTP 200 with List<RankingResponse>. Access: Public via SecurityConfig matcher /api/v1/rounds/*/rankings.",
            operationId = "resultRankingGetPublishedRoundRankings"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get published round rankings completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/rounds/{roundId}/rankings")
    public ResponseEntity<List<RankingResponse>> getPublishedRoundRankings(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(null, trackId, roundId));
    }

    @Operation(
            summary = "Get Published Event Rankings",
            description = "Get Published Event Rankings through GET /api/v1/events/{eventId}/rankings. Successful execution returns HTTP 200 with List<RankingResponse>. Access: Public via SecurityConfig matcher /api/v1/events/*/rankings.",
            operationId = "resultRankingGetPublishedEventRankings"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get published event rankings completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/events/{eventId}/rankings")
    public ResponseEntity<List<RankingResponse>> getPublishedEventRankings(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @Operation(
            summary = "Get Published Track Rankings",
            description = "Get Published Track Rankings through GET /api/v1/tracks/{trackId}/rankings. Successful execution returns HTTP 200 with List<RankingResponse>. Access: Public via SecurityConfig matcher /api/v1/tracks/*/rankings.",
            operationId = "resultRankingGetPublishedTrackRankings"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get published track rankings completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/tracks/{trackId}/rankings")
    public ResponseEntity<List<RankingResponse>> getPublishedTrackRankings(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(description = "Unique event identifier. (optional)", required = false)
            @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @Operation(
            summary = "Get Public Event Leaderboard",
            description = "Get Public Event Leaderboard through GET /api/v1/public/events/{eventId}/leaderboard. Successful execution returns HTTP 200 with List<RankingResponse>. Access: Public via SecurityConfig matcher /api/v1/public/events/*/leaderboard.",
            operationId = "resultRankingGetPublicEventLeaderboard"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get public event leaderboard completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/public/events/{eventId}/leaderboard")
    public ResponseEntity<List<RankingResponse>> getPublicEventLeaderboard(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @Operation(
            summary = "Get Public Track Leaderboard",
            description = "Get Public Track Leaderboard through GET /api/v1/public/events/{eventId}/tracks/{trackId}/leaderboard. Successful execution returns HTTP 200 with List<RankingResponse>. Access: Public via SecurityConfig matcher /api/v1/public/events/*/tracks/*/leaderboard.",
            operationId = "resultRankingGetPublicTrackLeaderboard"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get public track leaderboard completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/public/events/{eventId}/tracks/{trackId}/leaderboard")
    public ResponseEntity<List<RankingResponse>> getPublicTrackLeaderboard(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @PreAuthorize("@eventSecurity.canManageEvent(#eventId, authentication)")
    @Operation(
            summary = "Get Coordinator Event Results",
            description = "Get Coordinator Event Results through GET /api/v1/events/{eventId}/results. Successful execution returns HTTP 200 with List<RankingResponse>. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/results; @PreAuthorize(\"@eventSecurity.canManageEvent(#eventId, authentication)\").",
            operationId = "resultRankingGetCoordinatorEventResults",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get coordinator event results completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/events/{eventId}/results")
    public ResponseEntity<List<RankingResponse>> getCoordinatorEventResults(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.getCoordinatorRankings(eventId, trackId, roundId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageRound(#roundId, authentication)")
    @Operation(
            summary = "Get Coordinator Round Results",
            description = "Get Coordinator Round Results through GET /api/v1/rounds/{roundId}/results. Successful execution returns HTTP 200 with List<RankingResponse>. Access: SecurityConfig role COORDINATOR via matcher /api/v1/rounds/*/results; @PreAuthorize(\"@eventSecurity.canManageRound(#roundId, authentication)\").",
            operationId = "resultRankingGetCoordinatorRoundResults",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get coordinator round results completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "401",
                    description = "Authentication is required or the access token is invalid.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "403",
                    description = "The authenticated user does not satisfy the required authorization policy.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "404",
                    description = "The requested resource or action token was not found.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/rounds/{roundId}/results")
    public ResponseEntity<List<RankingResponse>> getCoordinatorRoundResults(
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.getCoordinatorRankings(null, trackId, roundId, authentication));
    }
}
