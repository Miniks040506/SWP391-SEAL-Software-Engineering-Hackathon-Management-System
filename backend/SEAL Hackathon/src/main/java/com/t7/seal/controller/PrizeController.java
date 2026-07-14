package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.results.AwardPrizeRequest;
import com.t7.seal.request.results.ClearPrizeAwardRequest;
import com.t7.seal.request.results.CreatePrizeRequest;
import com.t7.seal.request.results.UpdatePrizeRequest;
import com.t7.seal.response.ApiErrorResponse;
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
@Tag(
        name = "Prizes",
        description = "Prize CRUD and event prize lookup."
)
public class PrizeController {

    private final PrizeService prizeService;

    @PreAuthorize("@eventSecurity.canManagePrize(authentication)")
    @Operation(
            summary = "Create Prize",
            description = "Create Prize through POST /api/v1/prizes. Successful execution returns HTTP 201 with PrizeResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/prizes; @PreAuthorize(\"@eventSecurity.canManagePrize(authentication)\"). Requires a CreatePrizeRequest request body validated with Jakarta Bean Validation.",
            operationId = "prizeCreatePrize",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create prize completed and the resource was created.",
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
    @PostMapping
    public ResponseEntity<PrizeResponse> createPrize(
            @Valid @RequestBody CreatePrizeRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(prizeService.createPrize(request, authentication));
    }

    @Operation(
            summary = "Get Prizes By Event",
            description = "Get Prizes By Event through GET /api/v1/prizes/events/{eventId}. Successful execution returns HTTP 200 with List<PrizeResponse>. Access: Public via SecurityConfig matcher /api/v1/prizes/events/*.",
            operationId = "prizeGetPrizesByEvent"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get prizes by event completed successfully.",
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
    @GetMapping("/events/{eventId}")
    public ResponseEntity<List<PrizeResponse>> getPrizesByEvent(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId
    ) {
        return ResponseEntity.ok(prizeService.getPrizesByEvent(eventId));
    }

    @Operation(
            summary = "Get Prize By Id",
            description = "Get Prize By Id through GET /api/v1/prizes/{prizeId}. Successful execution returns HTTP 200 with PrizeResponse. Access: Public via SecurityConfig matcher /api/v1/prizes/*.",
            operationId = "prizeGetPrizeById"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get prize by id completed successfully.",
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
    @GetMapping("/{prizeId}")
    public ResponseEntity<PrizeResponse> getPrizeById(
            @Parameter(description = "Unique prize identifier.", required = true)
            @PathVariable UUID prizeId
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
            Authentication authentication
    ) {
        prizeService.deletePrize(prizeId, authentication);
        return ResponseEntity.noContent().build();
    }
}
