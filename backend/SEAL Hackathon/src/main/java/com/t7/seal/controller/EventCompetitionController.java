package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.team.EventCompetitionResponse;
import com.t7.seal.service.TeamService;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/events")
@RequiredArgsConstructor
@Tag(
        name = "Event Competition",
        description = "Participant competition view for an event."
)
public class EventCompetitionController {

    private final TeamService teamService;

    @PreAuthorize("hasRole('STUDENT')")
    @GetMapping("/{eventId}/competition/me")
    public ResponseEntity<EventCompetitionResponse> getMyEventCompetition(
            @PathVariable UUID eventId,
            Authentication authentication
    ) {
        return ResponseEntity.ok(teamService.getMyEventCompetition(eventId, authentication));
    }
}
