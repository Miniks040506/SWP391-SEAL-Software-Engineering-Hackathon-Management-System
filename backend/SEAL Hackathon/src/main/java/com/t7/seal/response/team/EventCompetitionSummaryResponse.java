package com.t7.seal.response.team;

import java.util.UUID;

public record EventCompetitionSummaryResponse(
        UUID eventId,
        String eventName,
        String eventStatus,
        UUID teamId,
        String teamName,
        String teamStatus,
        UUID trackId,
        String trackName
) {}
