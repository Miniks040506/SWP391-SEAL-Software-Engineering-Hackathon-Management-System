package com.t7.seal.request.round;

import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record UpdateRoundRequest(
        @Size(max = 200) String name,
        Integer orderIndex,
        Boolean isFinal,
        LocalDateTime submissionDeadline,
        LocalDateTime judgingDeadline,
        String status
) {}