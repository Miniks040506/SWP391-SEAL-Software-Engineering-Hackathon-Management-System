package com.t7.seal.request.round;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

@Schema(name = "ConfirmAdvancementRequest", description = "Request payload for confirm advancement.")
public record ConfirmAdvancementRequest(
        @Schema(
                description = "Collection of advanced team ids."
        )
        List<UUID> advancedTeamIds,
        @Schema(
                description = "Collection of overrides."
        )
        @Valid List<AdvancementOverrideRequest> overrides,
        @Schema(
                description = "Optional business note.",
                example = "Example test note."
        )
        @Size(max = 500) String note
) {}
