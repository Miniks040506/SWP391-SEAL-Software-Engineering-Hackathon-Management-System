package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "JoinTeamByCodeRequest", description = "Request payload for join team by code.")
public record JoinTeamByCodeRequest(
        @Schema(
                description = "Team join code.",
                example = "QACOMPLETE",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String joinCode
) {}