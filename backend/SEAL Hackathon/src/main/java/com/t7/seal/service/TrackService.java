package com.t7.seal.service;

import com.t7.seal.request.track.RegisterTeamTrackRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.team.TeamResponse;
import com.t7.seal.request.track.CreateTrackRequest;
import com.t7.seal.request.track.UpdateTrackRequest;
import com.t7.seal.response.track.TrackDetailResponse;
import com.t7.seal.response.track.TrackResponse;
import com.t7.seal.response.track.TrackTeamProgressResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.UUID;

public interface TrackService {
    TrackResponse createTrack(UUID eventId, CreateTrackRequest request, Authentication authentication);

    List<TrackResponse> getTracksByEvent(UUID eventId, Authentication authentication);

    TrackDetailResponse getTrackById(UUID trackId, Authentication authentication);

    TrackResponse updateTrack(UUID trackId, UpdateTrackRequest request, Authentication authentication);

    void deleteTrack(UUID trackId, Authentication authentication);

    PageResponse<TrackTeamProgressResponse> getTrackTeams(UUID trackId, int page, int size, Authentication authentication);

    TeamResponse registerTeamForTrack(UUID teamId, RegisterTeamTrackRequest request, Authentication authentication);
}
