package com.t7.seal.request.round;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

public record AdvancementOverrideRequest(
        @NotNull UUID teamId,
        @NotNull Boolean advanced,
        @Size(max = 500) String reason
) {
}
