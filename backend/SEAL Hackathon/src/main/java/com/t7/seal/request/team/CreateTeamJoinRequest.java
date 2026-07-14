package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(name = "CreateTeamJoinRequest", description = "Request payload for create team join.")
public record CreateTeamJoinRequest(
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed"
        )
        @Size(max = 1000) String message
) {}
