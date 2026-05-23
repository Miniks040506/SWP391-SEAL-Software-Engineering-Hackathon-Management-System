package com.t7.seal.request.results;

import java.math.BigDecimal;

public record UpdatePrizeRequest(
        Integer rankPosition, String title, String description,
        BigDecimal value, String currency, String sponsorName
) {}