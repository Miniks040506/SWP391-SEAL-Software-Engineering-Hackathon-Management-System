package com.t7.seal.response.round;

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