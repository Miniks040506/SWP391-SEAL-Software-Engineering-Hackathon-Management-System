package com.t7.seal.response.results;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record PrizeAssignmentResponse(
        UUID eventId,
        UUID roundId,
        UUID trackId,
        Integer prizeCount,
        Integer awardedCount,
        Integer skippedCount,
        Boolean notificationSent,
        Boolean emailQueued,
        LocalDateTime assignedAt,
        List<PrizeResponse> prizes
) {
}
