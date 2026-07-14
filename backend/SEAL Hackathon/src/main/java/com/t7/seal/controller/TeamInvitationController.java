package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.team.ReasonRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.team.TeamInvitationResponse;
import com.t7.seal.response.team.TeamMemberResponse;
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
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/invitations")
@RequiredArgsConstructor
@Tag(
        name = "Team Invitations",
        description = "Invitation inbox and token-based invitation actions."
)
public class TeamInvitationController {

    private final TeamService teamService;

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Get My Invitations",
            description = "Get My Invitations through GET /api/v1/invitations/me. Successful execution returns HTTP 200 with List<TeamInvitationResponse>. Access: Authenticated via SecurityConfig matcher /api/v1/invitations/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamInvitationGetMyInvitations",
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
    @GetMapping("/me")
    public ResponseEntity<List<TeamInvitationResponse>> getMyInvitations(@Parameter(hidden = true) Authentication authentication) {
        return ResponseEntity.ok(teamService.getMyInvitations(authentication));
    }

    @Operation(
            summary = "Get Invitation By Token",
            description = "Get Invitation By Token through GET /api/v1/invitations/token/{token}. Successful execution returns HTTP 200 with TeamInvitationResponse. Access: Public via SecurityConfig matcher /api/v1/invitations/token/*.",
            operationId = "teamInvitationGetInvitationByToken"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get invitation by token completed successfully.",
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
    @GetMapping("/token/{token}")
    public ResponseEntity<TeamInvitationResponse> getInvitationByToken(@Parameter(description = "Opaque action or verification token.", required = true)
                                                                       @PathVariable String token) {
        return ResponseEntity.ok(teamService.getInvitationByToken(token));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Accept Invitation",
            description = "Accept Invitation through POST /api/v1/invitations/{invitationId}/accept. Successful execution returns HTTP 200 with TeamMemberResponse. Access: Authenticated via SecurityConfig matcher /api/v1/invitations/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamInvitationAcceptInvitation",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Accept invitation completed successfully.",
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
    @PostMapping("/{invitationId}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitation(
            @Parameter(description = "Unique invitation identifier.", required = true)
            @PathVariable UUID invitationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.acceptInvitation(invitationId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Accept Invitation By Token",
            description = "Accept Invitation By Token through POST /api/v1/invitations/token/{token}/accept. Successful execution returns HTTP 200 with TeamMemberResponse. Access: Authenticated via SecurityConfig matcher /api/v1/invitations/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamInvitationAcceptInvitationByToken",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Accept invitation by token completed successfully.",
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
    @PostMapping("/token/{token}/accept")
    public ResponseEntity<TeamMemberResponse> acceptInvitationByToken(
            @Parameter(description = "Opaque action or verification token.", required = true)
            @PathVariable String token,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.acceptInvitationByToken(token, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Reject Invitation",
            description = "Reject Invitation through POST /api/v1/invitations/{invitationId}/reject. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher /api/v1/invitations/**; @PreAuthorize(\"isAuthenticated()\"). Optionally accepts a ReasonRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamInvitationRejectInvitation",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reject invitation completed successfully with no response body."),
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
    @PostMapping("/{invitationId}/reject")
    public ResponseEntity<Void> rejectInvitation(
            @Parameter(description = "Unique invitation identifier.", required = true)
            @PathVariable UUID invitationId,
            @Valid @RequestBody(required = false) ReasonRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        teamService.rejectInvitation(invitationId, request, authentication);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Reject Invitation By Token",
            description = "Reject Invitation By Token through POST /api/v1/invitations/token/{token}/reject. Successful execution returns HTTP 204 without a response body. Access: Public via SecurityConfig matcher /api/v1/invitations/token/*/reject. Optionally accepts a ReasonRequest request body validated with Jakarta Bean Validation.",
            operationId = "teamInvitationRejectInvitationByToken"
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Reject invitation by token completed successfully with no response body."),
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
    @PostMapping("/token/{token}/reject")
    public ResponseEntity<Void> rejectInvitationByToken(
            @Parameter(description = "Opaque action or verification token.", required = true)
            @PathVariable String token,
            @Valid @RequestBody(required = false) ReasonRequest request
    ) {
        teamService.rejectInvitationByToken(token, request);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("isAuthenticated()")
    @Operation(
            summary = "Cancel Invitation",
            description = "Cancel Invitation through POST /api/v1/invitations/{invitationId}/cancel. Successful execution returns HTTP 204 without a response body. Access: Authenticated via SecurityConfig matcher /api/v1/invitations/**; @PreAuthorize(\"isAuthenticated()\").",
            operationId = "teamInvitationCancelInvitation",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Cancel invitation completed successfully with no response body."),
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
    @PostMapping("/{invitationId}/cancel")
    public ResponseEntity<Void> cancelInvitation(
            @Parameter(description = "Unique invitation identifier.", required = true)
            @PathVariable UUID invitationId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        teamService.cancelInvitation(invitationId, authentication);
        return ResponseEntity.noContent().build();
    }
}
