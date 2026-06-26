package com.t7.seal.response.team;

import java.time.LocalDateTime;
import java.util.UUID;

public record TeamAdvancementStatusResponse(
        UUID eventId,
        String eventName,
        UUID teamId,
        String teamName,
        String teamStatus,
        UUID trackId,
        String trackName,
        UUID roundId,
        String roundName,
        Boolean advancementConfirmed,
        LocalDateTime advancementConfirmedAt,
        Boolean advanced,
        Boolean eliminated,
        String advanceReason,
        Integer rankPosition,
        Double totalScore,
        UUID nextRoundId,
        String nextRoundName,
        String nextRoundStatus,
        Boolean canAccessNextRound,
        String message
) {
}
