package com.t7.seal.response.event;

import java.util.UUID;

public record EventSummaryResponse(
        UUID id, String name,
        String season, Integer year,
        String status, String bannerUrl
) {}
