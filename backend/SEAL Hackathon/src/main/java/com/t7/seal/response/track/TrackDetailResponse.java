package com.t7.seal.response.track;

import java.util.List;
import java.util.UUID;

public record TrackDetailResponse(
        UUID id, UUID eventId,
        String name, String description,
        Integer maxTeams, int registeredTeamCount,
        List<MentorAssignmentResponse> mentors
) {}
