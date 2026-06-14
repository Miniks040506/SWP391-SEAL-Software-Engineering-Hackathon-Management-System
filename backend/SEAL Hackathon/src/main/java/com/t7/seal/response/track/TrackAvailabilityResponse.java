package com.t7.seal.response.track;

import com.t7.seal.domain.SubmissionLinkType;

import java.util.List;
import java.util.UUID;

public record TrackAvailabilityResponse(
        UUID id,
        UUID eventId,
        String name,
        String description,
        Integer minMembers,
        Integer maxMembers,
        Integer maxTeams,
        long registeredTeamCount,
        Long remainingSlots,
        boolean full,
        List<SubmissionLinkType> requiredLinkTypes
) {
}
