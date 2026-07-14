package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.AssignPrizesFromRankingRequest;
import com.t7.seal.request.results.AwardPrizeRequest;
import com.t7.seal.request.results.ClearPrizeAwardRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.grading.AssignedSubmissionResponse;
import com.t7.seal.response.results.PrizeAssignmentResponse;
import com.t7.seal.response.results.PrizeResponse;
import com.t7.seal.service.PrizeService;
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
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Awards",
        description = "Award prizes, clear awards, and derive winners from ranking."
)
public class EventAwardController {

    private final PrizeService prizeService;

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @Operation(
            summary = "Award Prize",
            description = "Award Prize through POST /api/v1/prizes/{prizeId}/award. Successful execution returns HTTP 200 with PrizeResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/prizes/*/award; @PreAuthorize(\"@eventSecurity.canManagePrize(authentication)\"). Requires an AwardPrizeRequest request body validated with Jakarta Bean Validation.",
            operationId = "eventAwardAwardPrize",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Award prize completed successfully.",
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
    @PostMapping("/prizes/{prizeId}/award")
    public ResponseEntity<PrizeResponse> awardPrize(
            @Parameter(description = "Unique prize identifier.", required = true)
            @PathVariable UUID prizeId,
            @Valid @RequestBody AwardPrizeRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(prizeService.awardPrize(prizeId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @Operation(
            summary = "Clear Award",
            description = "Clear Award through POST /api/v1/prizes/{prizeId}/clear-award. Successful execution returns HTTP 200 with PrizeResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/prizes/*/clear-award; @PreAuthorize(\"@eventSecurity.canManagePrize(authentication)\"). Requires a ClearPrizeAwardRequest request body validated with Jakarta Bean Validation.",
            operationId = "eventAwardClearAward",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Clear award completed successfully.",
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
    @PostMapping("/prizes/{prizeId}/clear-award")
    public ResponseEntity<PrizeResponse> clearAward(
            @Parameter(description = "Unique prize identifier.", required = true)
            @PathVariable UUID prizeId,
            @Valid @RequestBody ClearPrizeAwardRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(prizeService.clearPrize(prizeId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PatchMapping("/prizes/{prizeId}/winner")
    public ResponseEntity<PrizeResponse> updatePrizeWinner(
            @PathVariable UUID prizeId,
            @Valid @RequestBody AwardPrizeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(prizeService.awardPrize(prizeId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @PostMapping("/events/{eventId}/prizes/assign-from-ranking")
    public ResponseEntity<PrizeAssignmentResponse> assignPrizesFromRanking(
            @PathVariable("eventId") UUID eventId,
            @Valid @RequestBody(required = false) AssignPrizesFromRankingRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(prizeService.assignPrizesFromRanking(eventId, request, authentication));
    }

    @GetMapping("events/{eventId}/awards")
    public ResponseEntity<List<PrizeResponse>> getPublishedAwards(
            @PathVariable("eventId") UUID eventId
    ) {
        return ResponseEntity.ok(prizeService.getPublishedAwards(eventId));
    }
}
