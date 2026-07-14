package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "TransferLeaderRequest", description = "Request payload for transfer leader.")
public record TransferLeaderRequest(
        @Schema(
                description = "UUID reference to the new leader user.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID newLeaderUserId
) {}
