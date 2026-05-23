package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.mentor.CreateMentorFeedbackRequest;
import com.t7.seal.request.mentor.UpdateMentorFeedbackRequest;
import com.t7.seal.response.mentor.MentorFeedbackResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/mentor-feedback")
//none of the mentors have records attribute for now, check and add laters
public class MentorController {
    @PostMapping("/teams/{teamId}")
    public ResponseEntity<MentorFeedbackResponse> createFeedback(
            @PathVariable("teamId") UUID teamId,
            @Valid @RequestBody CreateMentorFeedbackRequest request
    ) {
        return null;
    }

    //request a query beside path variable
    @GetMapping("/teams/{teamId}")
    public ResponseEntity<List<MentorFeedbackResponse>> getTeamFeedback(
            @PathVariable("teamId") UUID teamId
    ) {
        return null;
    }

    @GetMapping("/{feedbackId}")
    public ResponseEntity<MentorFeedbackResponse> getFeedbackById(
            @PathVariable("feedbackId") UUID feedbackId
    ) {
        return null;
    }

    @PatchMapping("/{feedbackId}")
    public ResponseEntity<MentorFeedbackResponse> updateFeedback(
            @PathVariable("feedbackId") UUID feedbackId,
            @Valid @RequestBody UpdateMentorFeedbackRequest request
    ) {
        return null;
    }

    @DeleteMapping("/{feedbackId}")
    public ResponseEntity<Void> deleteFeedback(
            @PathVariable("feedbackId") UUID feedbackId
    ) {
        return null;
    }
}
