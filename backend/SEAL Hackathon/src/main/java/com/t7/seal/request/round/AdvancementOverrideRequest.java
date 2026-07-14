package com.t7.seal.request.round;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.util.UUID;

@Schema(name = "AdvancementOverrideRequest", description = "Request payload for advancement override.")
public record AdvancementOverrideRequest(
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID teamId,
        @Schema(
                description = "Client-supplied value for advanced.",
                example = "true",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Boolean advanced,
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation."
        )
        @Size(max = 500) String reason
) {}
