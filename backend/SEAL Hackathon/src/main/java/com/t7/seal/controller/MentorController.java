package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.mentor.CreateMentorFeedbackRequest;
import com.t7.seal.request.mentor.UpdateMentorFeedbackRequest;
import com.t7.seal.response.mentor.MentorFeedbackResponse;
import com.t7.seal.service.MentorFeedbackService;
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

    private MentorFeedbackService mentorFeedbackService;

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

    @GetMapping("/teams/{teamId}/feedback")
    public ResponseEntity<List<MentorFeedbackResponse>> getTeamFeedback(
            @PathVariable("teamId") UUID teamId,
            Authentication authentication
    ) {
        return null;
    }

    @GetMapping("/mentor-feedback/{feedbackId}")
    public ResponseEntity<MentorFeedbackResponse> getFeedbackById(
            @PathVariable("feedbackId") UUID feedbackId,
            Authentication authentication
    ) {
        return null;
    }

    @PatchMapping("/mentor-feedback/{feedbackId}")
    public ResponseEntity<MentorFeedbackResponse> updateFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            @Valid @RequestBody UpdateMentorFeedbackRequest request,
            Authentication authentication
    ) {
        return null;
    }

    @DeleteMapping("/mentor-feedback/{feedbackId}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            Authentication authentication
    ) {
        return null;
    }

    @PostMapping("/mentor-feedback/{feedbackId}/publish")
    public ResponseEntity<MentorFeedbackResponse> publishFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            Authentication authentication
    ) {
        return null;
    }
}
