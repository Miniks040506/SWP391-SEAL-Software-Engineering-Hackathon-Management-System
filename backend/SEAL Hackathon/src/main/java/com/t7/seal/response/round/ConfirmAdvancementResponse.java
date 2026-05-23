package com.t7.seal.response.round;

import java.time.LocalDateTime;
import java.util.UUID;

public record ConfirmAdvancementResponse(
        UUID roundId, int advancedCount,
        LocalDateTime confirmedAt
) {}