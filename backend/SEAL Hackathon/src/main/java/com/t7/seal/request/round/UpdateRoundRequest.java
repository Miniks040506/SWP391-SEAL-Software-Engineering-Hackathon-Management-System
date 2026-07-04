package com.t7.seal.request.round;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateRoundRequest(
        @Size(max = 200) String name,
        @Size(max = 10000) String description,
        Integer orderIndex,
        Boolean isFinal,
        LocalDateTime startAt,
        LocalDateTime endAt,
        LocalDateTime submissionDeadline,
        LocalDateTime judgingDeadline,
        String status
) {}
