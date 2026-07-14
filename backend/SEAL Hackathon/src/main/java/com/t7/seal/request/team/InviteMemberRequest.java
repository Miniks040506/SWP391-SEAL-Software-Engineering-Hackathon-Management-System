package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "InviteMemberRequest", description = "Request payload for invite member.")
public record InviteMemberRequest(
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String email,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed"
        )
        String message
) {}
