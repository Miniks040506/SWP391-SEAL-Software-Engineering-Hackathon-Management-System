package com.t7.seal.response.event;

import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.response.track.TrackResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventDetailResponse(
        UUID id,
        String name,
        String description,
        String season,
        Integer year,
        String status,
        String bannerUrl,
        LocalDateTime registrationStartAt,
        LocalDateTime registrationEndAt,
        List<TrackResponse> tracks,
        List<RoundResponse> rounds
) {}
