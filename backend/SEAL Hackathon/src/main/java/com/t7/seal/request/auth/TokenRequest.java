package com.t7.seal.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "TokenRequest", description = "Request payload for token.")
public record TokenRequest(
        @Schema(
                description = "One-time or refresh token, depending on the operation.",
                example = "sample-one-time-token",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String token
) {}
