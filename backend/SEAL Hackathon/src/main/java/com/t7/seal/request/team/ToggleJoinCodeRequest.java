package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

@Schema(name = "ToggleJoinCodeRequest", description = "Request payload for toggle join code.")
public record ToggleJoinCodeRequest(
        @Schema(
                description = "Whether the feature is enabled.",
                example = "true",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Boolean enabled
) {}
