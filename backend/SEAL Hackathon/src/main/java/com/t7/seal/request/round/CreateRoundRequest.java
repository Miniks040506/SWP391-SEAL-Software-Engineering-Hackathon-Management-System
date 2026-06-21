package com.t7.seal.request.round;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateRoundRequest(
        @NotBlank @Size(max = 200) String name,
        @Size(max = 10000) String description,
        @NotNull Integer orderIndex,
        Boolean isFinal,
        LocalDateTime submissionDeadline,
        LocalDateTime judgingDeadline
) {}
