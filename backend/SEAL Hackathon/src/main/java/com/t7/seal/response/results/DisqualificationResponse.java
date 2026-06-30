package com.t7.seal.response.results;

import java.time.LocalDateTime;
import java.util.UUID;

public record DisqualificationResponse(
        UUID id,
        UUID submissionId,
        UUID issuedBy,
        String issuedByName,
        UUID teamId,
        String teamName,
        UUID eventId,
        String eventName,
        UUID roundId,
        String roundName,
        UUID trackId,
        String trackName,
        String reason,
        String evidenceUrl,
        String appealNote,
        String appealStatus,
        String submissionStatus,
        String teamStatus,
        LocalDateTime issuedAt,
        boolean rankingRecalculated,
        int clearedAwardCount
) {}
