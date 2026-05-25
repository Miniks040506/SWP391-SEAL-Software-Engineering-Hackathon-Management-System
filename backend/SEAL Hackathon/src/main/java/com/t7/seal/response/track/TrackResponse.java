package com.t7.seal.response.track;

import com.t7.seal.domain.SubmissionLinkType;

import java.util.List;
import java.util.UUID;

public record TrackResponse(
        UUID id, UUID eventId,
        String name, String description, Integer maxTeams,
        List<SubmissionLinkType> requiredLinkTypes
) {}
