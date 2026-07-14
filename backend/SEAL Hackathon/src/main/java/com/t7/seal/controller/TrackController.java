package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.track.AssignMentorRequest;
import com.t7.seal.request.track.CreateTrackRequest;
import com.t7.seal.request.track.RegisterTeamTrackRequest;
import com.t7.seal.request.track.UpdateTrackRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.response.track.*;
import com.t7.seal.service.MentorAssignmentService;
import com.t7.seal.service.TeamService;
import com.t7.seal.service.TrackService;
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
@RequestMapping(ApiPaths.API_V1)
@RequiredArgsConstructor
@Tag(
        name = "Tracks",
        description = "Track configuration, mentor assignment, availability, and registration."
)
public class TrackController {

    private final TrackService trackService;
    private final MentorAssignmentService mentorAssignmentService;
    private final TeamService teamService;

    @PreAuthorize("@eventSecurity.canCreateTrack(#eventId, authentication)")
    @Operation(
            summary = "Create Track",
            description = "Create Track through POST /api/v1/events/{eventId}/tracks. Successful execution returns HTTP 201 with TrackResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/events/*/tracks; @PreAuthorize(\"@eventSecurity.canCreateTrack(#eventId, authentication)\"). Requires a CreateTrackRequest request body validated with Jakarta Bean Validation.",
            operationId = "trackCreateTrack",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create track completed and the resource was created.",
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
    @PostMapping("/events/{eventId}/tracks")
    public ResponseEntity<TrackResponse> createTrack(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateTrackRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        TrackResponse response = trackService.createTrack(eventId, request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @Operation(
            summary = "Get Tracks By Event",
            description = "Get Tracks By Event through GET /api/v1/events/{eventId}/tracks. Successful execution returns HTTP 200 with List<TrackResponse>. Access: Public via SecurityConfig matcher /api/v1/events/*/tracks.",
            operationId = "trackGetTracksByEvent"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get tracks by event completed successfully.",
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
    @GetMapping("/events/{eventId}/tracks")
    public ResponseEntity<List<TrackResponse>> getTracksByEvent(
            @Parameter(description = "Unique event identifier.", required = true)
            @PathVariable UUID eventId,
            @Parameter(hidden = true) Authentication authentications
    ) {
        return ResponseEntity.ok(trackService.getTracksByEvent(eventId, authentications));
    }

    @Operation(
            summary = "Get Track By Id",
            description = "Get Track By Id through GET /api/v1/tracks/{trackId}. Successful execution returns HTTP 200 with TrackDetailResponse. Access: Public via SecurityConfig matcher /api/v1/tracks/*.",
            operationId = "trackGetTrackById"
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get track by id completed successfully.",
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
    @GetMapping("/tracks/{trackId}")
    public ResponseEntity<TrackDetailResponse> getTrackById(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(trackService.getTrackById(trackId, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @Operation(
            summary = "Update Track",
            description = "Update Track through PATCH /api/v1/tracks/{trackId}. Successful execution returns HTTP 200 with TrackResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/tracks/*; @PreAuthorize(\"@eventSecurity.canManageTrack(#trackId, authentication)\"). Requires an UpdateTrackRequest request body validated with Jakarta Bean Validation.",
            operationId = "trackUpdateTrack",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Update track completed successfully.",
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
    @PatchMapping("/tracks/{trackId}")
    public ResponseEntity<TrackResponse> updateTrack(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Valid @RequestBody UpdateTrackRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(trackService.updateTrack(trackId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @Operation(
            summary = "Delete Track",
            description = "Delete Track through DELETE /api/v1/tracks/{trackId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig role COORDINATOR via matcher /api/v1/tracks/*; @PreAuthorize(\"@eventSecurity.canManageTrack(#trackId, authentication)\").",
            operationId = "trackDeleteTrack",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Delete track completed successfully with no response body."),
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
    @DeleteMapping("/tracks/{trackId}")
    public ResponseEntity<Void> deleteTrack(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        trackService.deleteTrack(trackId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @Operation(
            summary = "Assign Mentor",
            description = "Assign Mentor through POST /api/v1/tracks/{trackId}/mentor-assignments. Successful execution returns HTTP 201 with MentorAssignmentResponse. Access: SecurityConfig role COORDINATOR via matcher /api/v1/tracks/*/mentor-assignments/**; @PreAuthorize(\"@eventSecurity.canManageTrack(#trackId, authentication)\"). Requires an AssignMentorRequest request body validated with Jakarta Bean Validation.",
            operationId = "trackAssignMentor",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Assign mentor completed and the resource was created.",
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
    @PostMapping("/tracks/{trackId}/mentor-assignments")
    public ResponseEntity<MentorAssignmentResponse> assignMentor(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Valid @RequestBody AssignMentorRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        MentorAssignmentResponse response = mentorAssignmentService.assignMentor(trackId, request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @Operation(
            summary = "Get Mentor Assignments",
            description = "Get Mentor Assignments through GET /api/v1/tracks/{trackId}/mentor-assignments. Successful execution returns HTTP 200 with List<MentorAssignmentResponse>. Access: SecurityConfig role COORDINATOR via matcher /api/v1/tracks/*/mentor-assignments/**; @PreAuthorize(\"@eventSecurity.canManageTrack(#trackId, authentication)\").",
            operationId = "trackGetMentorAssignments",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get mentor assignments completed successfully.",
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
    @GetMapping("/tracks/{trackId}/mentor-assignments")
    public ResponseEntity<List<MentorAssignmentResponse>> getMentorAssignments(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId
    ) {
        return ResponseEntity.ok(mentorAssignmentService.getMentorAssignments(trackId));
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @Operation(
            summary = "Remove Mentor Assignment",
            description = "Remove Mentor Assignment through DELETE /api/v1/tracks/{trackId}/mentor-assignments/{assignmentId}. Successful execution returns HTTP 204 without a response body. Access: SecurityConfig role COORDINATOR via matcher /api/v1/tracks/*/mentor-assignments/**; @PreAuthorize(\"@eventSecurity.canManageTrack(#trackId, authentication)\").",
            operationId = "trackRemoveMentorAssignment",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(responseCode = "204", description = "Remove mentor assignment completed successfully with no response body."),
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
    @DeleteMapping("/tracks/{trackId}/mentor-assignments/{assignmentId}")
    public ResponseEntity<Void> removeMentorAssignment(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(description = "Assignment Id value.", required = true)
            @PathVariable UUID assignmentId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        mentorAssignmentService.removeMentorAssignment(trackId, assignmentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @Operation(
            summary = "Get Track Teams",
            description = "Get Track Teams through GET /api/v1/tracks/{trackId}/teams. Successful execution returns HTTP 200 with PageResponse<TrackTeamProgressResponse>. Access: SecurityConfig roles MENTOR, COORDINATOR, ADMIN via matcher /api/v1/tracks/*/teams.",
            operationId = "trackGetTrackTeams",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get track teams completed successfully.",
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
    @GetMapping("/tracks/{trackId}/teams")
    public ResponseEntity<PageResponse<TrackTeamProgressResponse>> getTrackTeams(
            @Parameter(description = "Unique track identifier.", required = true)
            @PathVariable UUID trackId,
            @Parameter(description = "Zero-based result page index. (default: 0, optional)", required = false)
            @RequestParam(defaultValue = "0") int page,
            @Parameter(description = "Maximum number of items returned in one page. (default: 20, optional)", required = false)
            @RequestParam(defaultValue = "20") int size,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(trackService.getTrackTeams(trackId, page, size, authentication));
    }

    @PreAuthorize("hasRole('STUDENT')")
    @Operation(
            summary = "Register Team For Track",
            description = "Register Team For Track through POST /api/v1/teams/{teamId}/register-track. Successful execution returns HTTP 200 with TeamResponse. Access: Authenticated via SecurityConfig matcher /api/v1/teams/**; @PreAuthorize(\"hasRole('STUDENT')\"). Requires a RegisterTeamTrackRequest request body validated with Jakarta Bean Validation.",
            operationId = "trackRegisterTeamForTrack",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Register team for track completed successfully.",
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
    @PostMapping("/teams/{teamId}/register-track")
    public ResponseEntity<TeamResponse> registerTeamForTrack(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable UUID teamId,
            @Valid @RequestBody RegisterTeamTrackRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.registerTeamForTrack(teamId, request, authentication));
    }

    @GetMapping("/events/{eventId}/tracks/available")
    public ResponseEntity<List<TrackAvailabilityResponse>> getAvailableTracks(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(trackService.getAvailableTracks(eventId, authentication));
    }
}
