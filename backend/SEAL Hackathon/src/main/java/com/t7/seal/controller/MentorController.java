package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.mentor.CreateMentorFeedbackRequest;
import com.t7.seal.request.mentor.UpdateMentorFeedbackRequest;
import com.t7.seal.response.ApiErrorResponse;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.mentor.MentorFeedbackResponse;
import com.t7.seal.response.mentor.MentorTeamDetailResponse;
import com.t7.seal.response.mentor.MentorTeamProgressResponse;
import com.t7.seal.response.mentor.MentorTrackResponse;
import com.t7.seal.service.MentorFeedbackService;
import com.t7.seal.service.MentorTeamService;
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
@RequestMapping(ApiPaths.API_V1)
@Tag(
        name = "Mentors",
        description = "Mentor tracks, team progress, submissions, and feedback."
)
public class MentorController {

    private final MentorFeedbackService mentorFeedbackService;
    private final MentorTeamService mentorTeamService;

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Create Feedback",
            description = "Create Feedback through POST /api/v1/mentor/teams/{teamId}/feedback; POST /api/v1/mentor-feedback/teams/{teamId}. Successful execution returns HTTP 201 with MentorFeedbackResponse. Access: SecurityConfig roles MENTOR, COORDINATOR, ADMIN via matcher /api/v1/mentor/**; @PreAuthorize(\"hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')\"). Requires a CreateMentorFeedbackRequest request body validated with Jakarta Bean Validation.",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "201",
                    description = "Create feedback completed and the resource was created.",
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
    @PostMapping({
            "/mentor/teams/{teamId}/feedback",
            "/mentor-feedback/teams/{teamId}"
    })
    public ResponseEntity<MentorFeedbackResponse> createFeedback(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable("teamId") UUID teamId,
            @Valid @RequestBody CreateMentorFeedbackRequest request,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mentorFeedbackService.createFeedback(teamId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @Operation(
            summary = "Get Mentor Team Feedback",
            description = "Get Mentor Team Feedback through GET /api/v1/mentor/teams/{teamId}/feedback; GET /api/v1/mentor-feedback/teams/{teamId}. Successful execution returns HTTP 200 with List<MentorFeedbackResponse>. Access: SecurityConfig roles MENTOR, COORDINATOR, ADMIN via matcher /api/v1/mentor/**; @PreAuthorize(\"hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')\").",
            security = @SecurityRequirement(name = "bearerAuth")
    )
    @ApiResponses({
            @ApiResponse(
                    responseCode = "200",
                    description = "Get mentor team feedback completed successfully.",
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
            "/mentor/teams/{teamId}/feedback",
            "/mentor-feedback/teams/{teamId}"
    })
    public ResponseEntity<List<MentorFeedbackResponse>> getMentorTeamFeedback(
            @Parameter(description = "Unique team identifier.", required = true)
            @PathVariable("teamId") UUID teamId,
            @Parameter(hidden = true) Authentication authentication
    ) {
        return ResponseEntity.ok(mentorFeedbackService.getMentorTeamFeedback(teamId, authentication));
    }

    @PreAuthorize("isAuthenticated()")
    @GetMapping("/teams/{teamId}/feedback")
    public ResponseEntity<List<MentorFeedbackResponse>> getTeamFeedback(
            @PathVariable("teamId") UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorFeedbackService.getTeamFeedback(teamId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping("/mentor-feedback/{feedbackId}")
    public ResponseEntity<MentorFeedbackResponse> getFeedbackById(
            @PathVariable("feedbackId") UUID feedbackId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorFeedbackService.getFeedbackById(feedbackId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @PatchMapping("/mentor-feedback/{feedbackId}")
    public ResponseEntity<MentorFeedbackResponse> updateFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            @Valid @RequestBody UpdateMentorFeedbackRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorFeedbackService.updateFeedback(feedbackId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @DeleteMapping("/mentor-feedback/{feedbackId}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            Authentication authentication
    ) {
        mentorFeedbackService.deleteFeedback(feedbackId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @PostMapping("/mentor-feedback/{feedbackId}/publish")
    public ResponseEntity<MentorFeedbackResponse> publishFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorFeedbackService.publishFeedback(feedbackId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping("/mentor/tracks")
    public ResponseEntity<List<MentorTrackResponse>> getMyAssignedTracks(
            @RequestParam(required = false) UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorTeamService.getMyAssignedTracks(eventId, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping("/mentor/tracks/{trackId}/teams")
    public ResponseEntity<PageResponse<MentorTeamProgressResponse>> getTeamInAssignedTracks(
            @PathVariable UUID trackId,
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String search,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorTeamService.getTeamInAssignedTracks(trackId, status, search, page, size, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping("/mentor/teams/{teamId}")
    public ResponseEntity<MentorTeamDetailResponse> getAssignedTeamDetails(
            @PathVariable UUID teamId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(mentorTeamService.getAssignedTeamDetails(teamId, authentication));
    }
}
