package com.t7.seal.response.round;

import java.time.LocalDateTime;
import java.util.UUID;

public record RoundResponse(
        UUID id,
        UUID eventId,
        String name,
        String description,
        Integer orderIndex,
        Boolean isFinal,
        String status,
        LocalDateTime submissionDeadline,
        LocalDateTime judgingDeadline
) {}
