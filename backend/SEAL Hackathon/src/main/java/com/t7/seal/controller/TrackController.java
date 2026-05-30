package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.track.AssignMentorRequest;
import com.t7.seal.request.track.CreateTrackRequest;
import com.t7.seal.request.track.RegisterTeamTrackRequest;
import com.t7.seal.request.track.UpdateTrackRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.response.track.MentorAssignmentResponse;
import com.t7.seal.response.track.TrackDetailResponse;
import com.t7.seal.response.track.TrackResponse;
import com.t7.seal.response.track.TrackTeamProgressResponse;
import com.t7.seal.service.MentorAssignmentService;
import com.t7.seal.service.TrackService;
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
public class TrackController {

    private final TrackService trackService;
    private final MentorAssignmentService mentorAssignmentService;
//    private final TeamService teamService;

    @PreAuthorize("@eventSecurity.canCreateTrack(#eventId, authentication)")
    @PostMapping("/events/{eventId}/tracks")
    public ResponseEntity<TrackResponse> createTrack(
            @PathVariable UUID eventId,
            @Valid @RequestBody CreateTrackRequest request,
            Authentication authentication
    ) {
        TrackResponse response = trackService.createTrack(eventId, request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @GetMapping("/events/{eventId}/tracks")
    public ResponseEntity<List<TrackResponse>> getTracksByEvent(
            @PathVariable UUID eventId
    ) {
        return ResponseEntity.ok(trackService.getTracksByEvent(eventId));
    }

    @GetMapping("/tracks/{trackId}")
    public ResponseEntity<TrackDetailResponse> getTrackById(
            @PathVariable UUID trackId
    ) {
        return ResponseEntity.ok(trackService.getTrackById(trackId));
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @PatchMapping("/tracks/{trackId}")
    public ResponseEntity<TrackResponse> updateTrack(
            @PathVariable UUID trackId,
            @Valid @RequestBody UpdateTrackRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(trackService.updateTrack(trackId, request, authentication));
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @DeleteMapping("/tracks/{trackId}")
    public ResponseEntity<Void> deleteTrack(
            @PathVariable UUID trackId,
            Authentication authentication
    ) {
        trackService.deleteTrack(trackId, authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @PostMapping("/tracks/{trackId}/mentor-assignments")
    public ResponseEntity<MentorAssignmentResponse> assignMentor(
            @PathVariable UUID trackId,
            @Valid @RequestBody AssignMentorRequest request,
            Authentication authentication
    ) {
        MentorAssignmentResponse response = mentorAssignmentService.assignMentor(trackId, request, authentication);
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @GetMapping("/tracks/{trackId}/mentor-assignments")
    public ResponseEntity<List<MentorAssignmentResponse>> getMentorAssignments(
            @PathVariable UUID trackId
    ) {
        return ResponseEntity.ok(mentorAssignmentService.getMentorAssignments(trackId));
    }

    @PreAuthorize("@eventSecurity.canManageTrack(#trackId, authentication)")
    @DeleteMapping("/tracks/{trackId}/mentor-assignments/{assignmentId}")
    public ResponseEntity<Void> removeMentorAssignment(
            @PathVariable UUID trackId,
            @PathVariable UUID assignmentId,
            Authentication authentication
    ) {
        mentorAssignmentService.removeMentorAssignment(trackId, assignmentId, authentication);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/tracks/{trackId}/teams")
    public ResponseEntity<PageResponse<TrackTeamProgressResponse>> getTrackTeams(
            @PathVariable UUID trackId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        return null;
    }

    @PostMapping("/teams/{teamId}/register-track")
    public ResponseEntity<TeamResponse> registerTeamForTrack(
            @PathVariable UUID teamId,
            @Valid @RequestBody RegisterTeamTrackRequest request
    ) {
        return null;
    }
}
