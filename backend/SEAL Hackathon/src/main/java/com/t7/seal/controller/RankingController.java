package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.RecalculateRankingRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.results.RankingRecalculationResponse;
import com.t7.seal.response.results.RankingResponse;
import com.t7.seal.response.results.TeamRankingHistoryResponse;
import com.t7.seal.service.RankingService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
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
@RequestMapping(ApiPaths.API_V1 + "/rankings")
@Tag(
        name = "Ranking Queries",
        description = "Filtered rankings and team ranking history."
)
public class RankingController {

    private final RankingService rankingService;

    @Operation(
            summary = "Get Rankings",
            description = "Get Rankings through GET /api/v1/rankings. Successful execution returns HTTP 200 with List<RankingResponse>. Access: Public via SecurityConfig matcher /api/v1/rankings/**.",
            operationId = "rankingGetRankings"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get rankings completed successfully.",
                    useReturnTypeSchema = true
            ),
            @ApiResponse(
                    responseCode = "400",
                    description = "Request syntax, parameter conversion, or validation failed.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            ),
            @ApiResponse(
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping
    public ResponseEntity<List<RankingResponse>> getRankings(
            @Parameter(description = "Unique event identifier. (optional)", required = false)
            @RequestParam(required = false) UUID eventId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @RequestParam(required = false) UUID roundId,
            @Parameter(description = "Unique track identifier. (optional)", required = false)
            @RequestParam(required = false) UUID trackId
    ) {
        return ResponseEntity.ok(rankingService.getRankings(eventId, trackId, roundId));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Recalculate Ranking",
            description = "Recalculate Ranking through POST /api/v1/rankings/recalculate. Successful execution returns HTTP 200 with RankingRecalculationResponse. Access: SecurityConfig roles ADMIN, COORDINATOR via matcher /api/v1/rankings/recalculate; @PreAuthorize(\"hasAnyRole('ADMIN', 'COORDINATOR')\"). Requires a RecalculateRankingRequest request body validated with Jakarta Bean Validation.",
            operationId = "rankingRecalculateRanking",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Recalculate ranking completed successfully.",
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
    @PostMapping("/recalculate")
    public ResponseEntity<RankingRecalculationResponse> recalculateRanking(
            @Valid @RequestBody RecalculateRankingRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService
                .calculateRoundRankings(request.roundId(), request.trackId(), authentication)
        );
    }

    @Operation(
            summary = "Get Team Ranking History",
            description = "Get Team Ranking History through GET /api/v1/rankings/teams/{teamId}. Successful execution returns HTTP 200 with List<TeamRankingHistoryResponse>. Access: Public via SecurityConfig matcher /api/v1/rankings/**.",
            operationId = "rankingGetTeamRankingHistory"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team ranking history completed successfully.",
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
    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<TeamRankingHistoryResponse>> getTeamRankingHistory(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId
    ) {
        return ResponseEntity.ok(rankingService.getTeamRankingHistory(teamId));
    }
}
