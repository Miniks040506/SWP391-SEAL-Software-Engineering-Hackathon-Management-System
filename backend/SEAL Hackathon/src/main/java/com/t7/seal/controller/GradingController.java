package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.grading.ConfirmScoreSheetRequest;
import com.t7.seal.request.grading.SaveScoreSheetRequest;
import com.t7.seal.request.grading.UpdateScoreRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.grading.AssignedSubmissionResponse;
import com.t7.seal.response.grading.GradingSubmissionDetailResponse;
import com.t7.seal.response.grading.ScoreResponse;
import com.t7.seal.response.grading.ScoreSheetResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1 + "/grading")
public class GradingController {
    @GetMapping("/grading/rounds/{roundId}/assigned-submissions")
    public ResponseEntity<PageResponse<AssignedSubmissionResponse>> getAssignedSubmissions(
            @PathVariable("roundId") UUID roundId,
            @RequestParam(required = false) String status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @GetMapping("/grading/submissions/{submissionId}")
    public ResponseEntity<GradingSubmissionDetailResponse> getSubmissionForGrading(
            @PathVariable("submissionId") UUID submissionId,
            @Valid @RequestBody GradingSubmissionDetailResponse request
    ) {
        return null;
    }

    @GetMapping("/grading/submissions/{submissionId}/scores")
    public ResponseEntity<ScoreSheetResponse> getMyScoresForSubmission(
            @PathVariable("submissionId") UUID submissionId
    ) {
        return null;
    }

    @PostMapping("/grading/submissions/{submissionId}/scores")
    public ResponseEntity<ScoreSheetResponse> saveScores(
            @PathVariable("submissionId") UUID submissionId,
            @Valid @RequestBody SaveScoreSheetRequest request
    ) {
        return null;
    }

    @PostMapping("/grading/submissions/{submissionId}/scores/confirm")
    public ResponseEntity<ScoreSheetResponse> confirmScores(
            @PathVariable("submissionId") UUID submissionId,
            @Valid @RequestBody ConfirmScoreSheetRequest request
    ) {
        return null;
    }

    @PatchMapping("/scores/{scoreId}")
    public ResponseEntity<ScoreResponse> updateScore(
            @PathVariable("scoreId") UUID scoreId,
            @Valid @RequestBody UpdateScoreRequest request
    ) {
        return null;
    }

    @PostMapping("/scores/{scoreId}/confirm")
    public ResponseEntity<ScoreResponse> confirmScore(
            @PathVariable("scoreId") UUID scoreId
    ) {
        return null;
    }
 }
