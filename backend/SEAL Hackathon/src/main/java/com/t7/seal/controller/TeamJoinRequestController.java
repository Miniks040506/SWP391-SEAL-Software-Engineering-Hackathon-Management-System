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

    @Operation(
            summary = "Get For Current User",
            description = "Get For Current User through GET /api/v1/teams/join-requests/me. Successful execution returns HTTP 200 with List<TeamJoinRequestResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\").",
            operationId = "teamJoinRequestGetForCurrentUser",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get for current user completed successfully.",
                    useReturnTypeSchema = true
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
                    responseCode = "500",
                    description = "An unexpected server error occurred.",
                    content = @Content(schema = @Schema(implementation = ApiErrorResponse.class))
            )
    })
    @GetMapping("/teams/join-requests/me")
    @PreAuthorize("hasRole('STUDENT')")
    public ResponseEntity<List<TeamJoinRequestResponse>> getForCurrentUser(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(joinRequestService.getForCurrentUser(authentication));
    }

    @Operation(
            summary = "Accept",
            description = "Accept through POST /api/v1/teams/join-requests/{requestId}/accept. Successful execution returns HTTP 200 with TeamMemberResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamJoinRequestAccept",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Accept completed successfully.",
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
    @PostMapping("/teams/join-requests/{requestId}/accept")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<TeamMemberResponse> accept(
            @Parameter(description = "Unique request identifier.", required = true)
            @PathVariable UUID requestId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(joinRequestService.accept(requestId, authentication));
    }

    @Operation(
            summary = "Reject",
            description = "Reject through POST /api/v1/teams/join-requests/{requestId}/reject. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Optionally accepts a ReasonRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamJoinRequestReject",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reject completed successfully with no response body."),
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
    @PostMapping("/teams/join-requests/{requestId}/reject")
    @PreAuthorize("isAuthenticated()")
    public ResponseEntity<Void> reject(
            @Parameter(description = "Unique request identifier.", required = true)
            @PathVariable UUID requestId,
            @Valid @RequestBody(required = false) ReasonRequest reason,
            @Parameter(hidden = true) Authentication authentication
    ) {
        joinRequestService.reject(requestId, reason, authentication);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get By Token",
            description = "Get By Token through GET /api/v1/team-join-requests/token/{token}. Successful execution returns HTTP 200 with TeamJoinRequestResponse. Access: Public via SecurityConfig matcher /api/v1/team-join-requests/token/*.",
            operationId = "teamJoinRequestGetByToken"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get by token completed successfully.",
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
    @GetMapping("/team-join-requests/token/{token}")
    public ResponseEntity<TeamJoinRequestResponse> getByToken(@Parameter(description = "Opaque action or verification token.", required = true)
                                                              @PathVariable String token) {
        return ResponseEntity.ok(joinRequestService.getByToken(token));
    }

    @Operation(
            summary = "Accept By Token",
            description = "Accept By Token through POST /api/v1/team-join-requests/token/{token}/accept. Successful execution returns HTTP 200 with TeamMemberResponse. Access: Public via SecurityConfig matcher /api/v1/team-join-requests/token/*/accept.",
            operationId = "teamJoinRequestAcceptByToken"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Accept by token completed successfully.",
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
    @PostMapping("/team-join-requests/token/{token}/accept")
    public ResponseEntity<TeamMemberResponse> acceptByToken(@Parameter(description = "Opaque action or verification token.", required = true)
                                                            @PathVariable String token) {
        return ResponseEntity.ok(joinRequestService.acceptByToken(token));
    }

    @Operation(
            summary = "Reject By Token",
            description = "Reject By Token through POST /api/v1/team-join-requests/token/{token}/reject. Successful execution returns HTTP 204 without a response body. Access: Public via SecurityConfig matcher /api/v1/team-join-requests/token/*/reject. Optionally accepts a ReasonRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamJoinRequestRejectByToken"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reject by token completed successfully with no response body."),
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
    @PostMapping("/team-join-requests/token/{token}/reject")
    public ResponseEntity<Void> rejectByToken(
            @Parameter(description = "Opaque action or verification token.", required = true)
            @PathVariable String token,
            @Valid @RequestBody(required = false) ReasonRequest reason
    ) {
        joinRequestService.rejectByToken(token, reason);
        return ResponseEntity.noContent().build();
    }
}
