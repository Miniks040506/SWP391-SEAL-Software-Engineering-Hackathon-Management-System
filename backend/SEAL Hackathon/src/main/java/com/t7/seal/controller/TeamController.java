package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.*;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.team.*;
import com.t7.seal.response.submission.TeamDetailedScoreResponse;
import com.t7.seal.service.RankingService;
import com.t7.seal.service.TeamService;
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
@RequestMapping(ApiPaths.API_V1 + "/teams")
@RequiredArgsConstructor
@Tag(
        name = "Teams",
        description = "Team lifecycle, membership, invitations, join codes, and advancement status."
)
public class TeamController {

    private final TeamService teamService;
    private final RankingService rankingService;

    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Create Team",
            description = "Create Team through POST /api/v1/teams. Successful execution returns HTTP 201 with TeamResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\"). Requires a CreateTeamRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamCreateTeam",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create team completed and the resource was created.",
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
    public ResponseEntity<TeamResponse> createTeam(
            @Valid @RequestBody CreateTeamRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.createTeam(request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get My Teams",
            description = "Get My Teams through GET /api/v1/teams/me. Successful execution returns HTTP 200 with List<TeamSummaryResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetMyTeams",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my teams completed successfully.",
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
    @GetMapping("/me")
    public ResponseEntity<List<TeamSummaryResponse>> getMyTeams(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyTeams(authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Get My Active Competitions",
            description = "Get My Active Competitions through GET /api/v1/teams/competitions/me. Successful execution returns HTTP 200 with List<EventCompetitionSummaryResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\").",
            operationId = "teamGetMyActiveCompetitions",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my active competitions completed successfully.",
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
    @GetMapping("/competitions/me")
    public ResponseEntity<List<EventCompetitionSummaryResponse>> getMyActiveCompetitions(
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getMyActiveCompetitions(authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get My Team Advancement Status",
            description = "Get My Team Advancement Status through GET /api/v1/teams/{teamId}/advancement-status; GET /api/v1/teams/{teamId}/rounds/{roundId}/advancement-status. Successful execution returns HTTP 200 with TeamAdvancementStatusResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my team advancement status completed successfully.",
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
    @GetMapping({
            "/{teamId}/advancement-status",
            "/{teamId}/rounds/{roundId}/advancement-status"
    })
    public ResponseEntity<TeamAdvancementStatusResponse> getMyTeamAdvancementStatus(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier. (optional)", required = false)
            @PathVariable(required = false) UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getMyTeamAdvancementStatus(teamId, roundId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Team Published Scores",
            description = "Get Team Published Scores through GET /api/v1/teams/{teamId}/scores. Successful execution returns HTTP 200 with List<TeamDetailedScoreResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetTeamPublishedScores",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team published scores completed successfully.",
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
    @GetMapping("/{teamId}/scores")
    public ResponseEntity<List<TeamDetailedScoreResponse>> getTeamPublishedScores(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.getPublishedTeamScores(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Team Published Round Score",
            description = "Get Team Published Round Score through GET /api/v1/teams/{teamId}/rounds/{roundId}/scores. Successful execution returns HTTP 200 with TeamDetailedScoreResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetTeamPublishedRoundScore",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team published round score completed successfully.",
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
    @GetMapping("/{teamId}/rounds/{roundId}/scores")
    public ResponseEntity<TeamDetailedScoreResponse> getTeamPublishedRoundScore(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(description = "Unique round identifier.", required = true)
            @PathVariable UUID roundId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(rankingService.getPublishedTeamRoundScore(teamId, roundId, authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Preview Join Code",
            description = "Preview Join Code through GET /api/v1/teams/join-code/{joinCode}. Successful execution returns HTTP 200 with TeamJoinCodePreviewResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\").",
            operationId = "teamPreviewJoinCode",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Preview join code completed successfully.",
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
    @GetMapping("/join-code/{joinCode}")
    public ResponseEntity<TeamJoinCodePreviewResponse> previewJoinCode(
            @Parameter(description = "Team join code.", required = true)
            @PathVariable String joinCode,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.previewJoinCode(joinCode, authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Join By Code",
            description = "Join By Code through POST /api/v1/teams/join-code. Successful execution returns HTTP 201 with TeamMemberResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\"). Requires a JoinTeamByCodeRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamJoinByCode",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Join by code completed and the resource was created.",
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
    @PostMapping("/join-code")
    public ResponseEntity<TeamMemberResponse> joinByCode(
            @Valid @RequestBody JoinTeamByCodeRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.joinByCode(request, authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Join By Code Path",
            description = "Join By Code Path through POST /api/v1/teams/join-code/{joinCode}. Successful execution returns HTTP 201 with TeamMemberResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\").",
            operationId = "teamJoinByCodePath",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Join by code path completed and the resource was created.",
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
    @PostMapping("/join-code/{joinCode}")
    public ResponseEntity<TeamMemberResponse> joinByCodePath(
            @Parameter(description = "Team join code.", required = true)
            @PathVariable String joinCode,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.joinByCode(joinCode, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get My Invitations",
            description = "Get My Invitations through GET /api/v1/teams/invitations/me. Successful execution returns HTTP 200 with List<TeamInvitationResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetMyInvitations",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get my invitations completed successfully.",
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
    @GetMapping("/invitations/me")
    public ResponseEntity<List<TeamInvitationResponse>> getMyInvitations(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyInvitations(authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Team By Id",
            description = "Get Team By Id through GET /api/v1/teams/{teamId}. Successful execution returns HTTP 200 with TeamDetailResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetTeamById",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team by id completed successfully.",
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
    @GetMapping("/{teamId}")
    public ResponseEntity<TeamDetailResponse> getTeamById(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamById(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Update Team",
            description = "Update Team through PATCH /api/v1/teams/{teamId}. Successful execution returns HTTP 200 with TeamResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Requires an UpdateTeamRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamUpdateTeam",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update team completed successfully.",
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
    @PatchMapping("/{teamId}")
    public ResponseEntity<TeamResponse> updateTeam(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Valid @RequestBody UpdateTeamRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.updateTeam(teamId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Invite Member",
            description = "Invite Member through POST /api/v1/teams/{teamId}/invitations; POST /api/v1/teams/{teamId}/invite. Successful execution returns HTTP 201 with TeamInvitationResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Requires an InviteMemberRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Invite member completed and the resource was created.",
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
    @PostMapping({"/{teamId}/invitations", "/{teamId}/invite"})
    public ResponseEntity<TeamInvitationResponse> inviteMember(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Valid @RequestBody InviteMemberRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(teamService.inviteMember(teamId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Team Invitations",
            description = "Get Team Invitations through GET /api/v1/teams/{teamId}/invitations. Successful execution returns HTTP 200 with List<TeamInvitationResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetTeamInvitations",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team invitations completed successfully.",
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
    @GetMapping("/{teamId}/invitations")
    public ResponseEntity<List<TeamInvitationResponse>> getTeamInvitations(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamInvitations(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get Team Members",
            description = "Get Team Members through GET /api/v1/teams/{teamId}/members. Successful execution returns HTTP 200 with List<TeamMemberResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamGetTeamMembers",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get team members completed successfully.",
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
    @GetMapping("/{teamId}/members")
    public ResponseEntity<List<TeamMemberResponse>> getTeamMembers(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getTeamMembers(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Delete Team",
            description = "Delete Team through DELETE /api/v1/teams/{teamId}. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"isAuthenticated()\"). Optionally accepts a ReasonRequest request body.",
            operationId = "teamDeleteTeam",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Delete team completed successfully with no response body."),
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
    @DeleteMapping("/{teamId}")
    public ResponseEntity<Void> deleteTeam(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @RequestBody(required = false) ReasonRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        teamService.deleteTeam(teamId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @DeleteMapping("/{teamId}/members/{memberId}")
    public ResponseEntity<Void> removeMember(
            @PathVariable UUID teamId,
            @PathVariable UUID memberId,
            @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.removeTeamMember(teamId, memberId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/invitations/{invitationId}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitation(
            @PathVariable UUID invitationId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.acceptInvitation(invitationId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/invitations/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @PathVariable UUID invitationId,
            @Valid @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.rejectInvitation(invitationId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{teamId}/transfer-leader")
    public ResponseEntity<TeamResponse> transferLeader(
            @PathVariable UUID teamId,
            @Valid @RequestBody TransferLeaderRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.transferLeader(teamId, request, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @PostMapping("/{teamId}/leave")
    public ResponseEntity<Void> leaveTeam(
            @PathVariable UUID teamId,
            @Valid @RequestBody(required = false) ReasonRequest request,
            Authentication authentication
    ) {
        teamService.leaveTeam(teamId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @PatchMapping("/{teamId}/join-code")
    public ResponseEntity<TeamResponse> toggleJoinCode(
            @PathVariable UUID teamId,
            @Valid @RequestBody ToggleJoinCodeRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.toggleJoinCode(teamId, request, authentication));
    }
}
