package com.t7.seal.service;

import com.t7.seal.response.track.TrackDetailResponse;
import com.t7.seal.response.track.TrackResponse;

import java.util.List;
import java.util.UUID;

public interface TrackService {
    List<TrackResponse> getTracksByEvent(UUID eventId);

    TrackDetailResponse getTrackById(UUID trackId);
}
