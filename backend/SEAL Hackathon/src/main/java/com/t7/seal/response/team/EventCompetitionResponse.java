package com.t7.seal.response.team;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record EventCompetitionResponse(
        UUID eventId,
        String eventName,
        String eventStatus,
        UUID teamId,
        String teamName,
        String teamStatus,
        Boolean leader,
        UUID trackId,
        String trackName,
        String trackDescription,
        List<EventCompetitionRoundResponse> rounds,
        LocalDateTime serverTime
) {}
