package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.CreateTeamJoinRequest;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.team.TeamJoinRequestResponse;
import com.t7.seal.response.team.TeamMemberResponse;
import com.t7.seal.service.TeamJoinRequestService;
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
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
@Tag(
        name = "Team Join Requests",
        description = "Participant join requests and leader decisions."
)
public class TeamJoinRequestController {

    private final TeamJoinRequestService joinRequestService;

    @Operation(
            summary = "Create",
            description = "Create through POST /api/v1/teams/{teamId}/join-requests. Successful execution returns HTTP 201 with TeamJoinRequestResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\"). Optionally accepts a CreateTeamJoinRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamJoinRequestCreate",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create completed and the resource was created.",
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
    @PostMapping("/teams/{teamId}/join-requests")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<TeamJoinRequestResponse> create(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Valid @RequestBody(required = false) CreateTeamJoinRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(joinRequestService.create(teamId, request, authentication));
    }

    @Operation(
            summary = "Get For Team",
            description = "Get For Team through GET /api/v1/teams/{teamId}/join-requests. Successful execution returns HTTP 200 with List<TeamJoinRequestResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamJoinRequestGetForTeam",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get for team completed successfully.",
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
    @GetMapping("/teams/{teamId}/join-requests")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<List<TeamJoinRequestResponse>> getForTeam(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(joinRequestService.getForTeam(teamId, authentication));
    }

    @GetMapping("/teams/join-requests/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TeamJoinRequestResponse>> getForCurrentUser(Authentication authentication) {
        return ResponseEntity.ok(joinRequestService.getForCurrentUser(authentication));
    }

    @PostMapping("/teams/join-requests/{requestId}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeamMemberResponse> accept(
            @PathVariable UUID requestId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(joinRequestService.accept(requestId, authentication));
    }

    @PostMapping("/teams/join-requests/{requestId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> reject(
            @PathVariable UUID requestId,
            @Valid @RequestBody(required = false) ReasonRequest reason,
            Authentication authentication
    ) {
        joinRequestService.reject(requestId, reason, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/team-join-requests/token/{token}")
    public ResponseEntity<TeamJoinRequestResponse> getByToken(@PathVariable String token) {
        return ResponseEntity.ok(joinRequestService.getByToken(token));
    }

    @PostMapping("/team-join-requests/token/{token}/accept")
    public ResponseEntity<TeamMemberResponse> acceptByToken(@PathVariable String token) {
        return ResponseEntity.ok(joinRequestService.acceptByToken(token));
    }

    @PostMapping("/team-join-requests/token/{token}/reject")
    public ResponseEntity<Void> rejectByToken(
            @PathVariable String token,
            @Valid @RequestBody(required = false) ReasonRequest reason
    ) {
        joinRequestService.rejectByToken(token, reason);
        return ResponseEntity.noContent().build();
    }
}
