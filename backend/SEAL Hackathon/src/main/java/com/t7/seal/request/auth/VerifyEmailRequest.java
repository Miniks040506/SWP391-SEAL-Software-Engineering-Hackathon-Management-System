package com.t7.seal.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;

@Schema(name = "VerifyEmailRequest", description = "Request payload for verify email.")
public record VerifyEmailRequest(
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String email,
        @Schema(
                description = "Client-supplied value for code.",
                example = "code example"
        )
        @Pattern(regexp = "\\d{6}", message = "Verification code must contain exactly 6 digits.")
        String code
) {}