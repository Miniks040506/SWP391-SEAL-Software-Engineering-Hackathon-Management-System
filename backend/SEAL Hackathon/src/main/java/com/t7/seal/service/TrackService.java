package com.t7.seal.service;

import com.t7.seal.request.track.CreateTrackRequest;
import com.t7.seal.request.track.UpdateTrackRequest;
import com.t7.seal.response.track.TrackDetailResponse;
import com.t7.seal.response.track.TrackResponse;

import java.util.List;
import java.util.UUID;

public interface TrackService {
    TrackResponse createTrack(UUID eventId, CreateTrackRequest request);

    List<TrackResponse> getTracksByEvent(UUID eventId);

    TrackDetailResponse getTrackById(UUID trackId);

    TrackResponse updateTrack(UUID trackId, UpdateTrackRequest request);

    void deleteTrack(UUID trackId);
}
