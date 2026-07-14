package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "UpdateAppealRequest", description = "Request payload for update appeal.")
public record UpdateAppealRequest(
        @Schema(
                description = "Client-supplied value for appeal note.",
                example = "appeal note example",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String appealNote
) {}
