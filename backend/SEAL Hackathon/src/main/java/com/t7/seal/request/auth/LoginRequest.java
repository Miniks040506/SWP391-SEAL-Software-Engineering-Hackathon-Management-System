package com.t7.seal.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "LoginRequest", description = "Request payload for login.")
public record LoginRequest(
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String email,
        @Schema(
                description = "Plain-text password accepted only in the request; it must never be logged or returned.",
                example = "Password@123",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String password
) {}
