package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.mentor.CreateMentorFeedbackRequest;
import com.t7.seal.request.mentor.UpdateMentorFeedbackRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.mentor.MentorFeedbackResponse;
import com.t7.seal.response.mentor.MentorTeamDetailResponse;
import com.t7.seal.response.mentor.MentorTeamProgressResponse;
import com.t7.seal.response.mentor.MentorTrackResponse;
import com.t7.seal.service.MentorFeedbackService;
import com.t7.seal.service.MentorTeamService;
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
public class MentorController {

    private final MentorFeedbackService mentorFeedbackService;
    private final MentorTeamService mentorTeamService;

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @PostMapping({
            "/mentor/teams/{teamId}/feedback",
            "/mentor-feedback/teams/{teamId}"
    })
    public ResponseEntity<MentorFeedbackResponse> createFeedback(
            @PathVariable("teamId") UUID teamId,
            @Valid @RequestBody CreateMentorFeedbackRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(mentorFeedbackService.createFeedback(teamId, request, authentication));
    }

    @PreAuthorize("hasAnyRole('MENTOR', 'ADMIN', 'COORDINATOR')")
    @GetMapping({
            "/mentor/teams/{teamId}/feedback",
            "/mentor-feedback/teams/{teamId}"
    })
    public ResponseEntity<List<MentorFeedbackResponse>> getMentorTeamFeedback(
            @PathVariable("teamId") UUID teamId,
            Authentication authentication
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
        return null;
    }
}
