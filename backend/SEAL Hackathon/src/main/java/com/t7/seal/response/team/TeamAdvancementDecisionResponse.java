package com.t7.seal.response.team;

import java.util.UUID;

public record TeamAdvancementDecisionResponse(
        UUID teamId,
        String teamName,
        UUID trackId,
        String trackName,
        Integer rankPosition,
        Double totalScore,
        Boolean suggestedAdvanced,
        Boolean finalAdvanced,
        String teamStatus,
        String advanceReason,
        String overrideReason
) {
}
