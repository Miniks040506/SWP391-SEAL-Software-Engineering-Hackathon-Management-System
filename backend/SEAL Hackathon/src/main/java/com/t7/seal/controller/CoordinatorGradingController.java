package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class CoordinatorGradingController {

    @GetMapping("/events/{eventId}/grading-progress")
    public ResponseEntity<?> getEventGradingProgress(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return null;
    }

    @GetMapping("/rounds/{roundId}/grading-progress")
    public ResponseEntity<?> getRoundGradingProgress(
            @PathVariable UUID roundId,
            Authentication authentication
    ) {
        return null;
    }

    @GetMapping("/judge-assignments/{assignmentId}/progress")
    public ResponseEntity<?> getJudgeAssignmentProgress(
            @PathVariable UUID assignmentId,
            Authentication authentication
    ) {
        return null;
    }
}
