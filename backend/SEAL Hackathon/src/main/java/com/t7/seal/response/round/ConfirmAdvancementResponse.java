package com.t7.seal.response.round;

import com.t7.seal.response.team.TeamAdvancementDecisionResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record ConfirmAdvancementResponse(
        UUID roundId,
        int advancedCount,
        int eliminatedCount,
        LocalDateTime confirmedAt,
        List<TeamAdvancementDecisionResponse> decisions,
        List<String> warnings
) {
}