package com.t7.seal.request.results;

import java.math.BigDecimal;
import java.util.UUID;

public record CreatePrizeRequest(
        UUID eventId, UUID trackId,
        Integer rankPosition, String title, String description,
        BigDecimal value, String currency, String sponsorName
) {}
