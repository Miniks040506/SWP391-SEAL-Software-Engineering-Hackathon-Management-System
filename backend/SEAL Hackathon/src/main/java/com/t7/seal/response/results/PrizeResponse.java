package com.t7.seal.response.results;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

public record PrizeResponse(
        UUID id, UUID eventId, UUID trackId,
        Integer rankPosition, String title, String description,
        BigDecimal value, String currency, String sponsorName,
        UUID awardedTeamId, LocalDateTime awardedAt
) {}
