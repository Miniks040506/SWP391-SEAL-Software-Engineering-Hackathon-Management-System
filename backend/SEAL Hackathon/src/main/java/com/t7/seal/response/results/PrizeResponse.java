package com.t7.seal.response.results;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PrizeResponse(
        UUID id,
        UUID eventId,
        String eventName,
        UUID trackId,
        String trackName,
        Integer rankPosition,
        String title,
        String description,
        BigDecimal value,
        String currency,
        String sponsorName,
        UUID awardedTeamId,
        String awardedTeamName,
        LocalDateTime awardedAt
) {
}
