package com.t7.seal.request.round;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;
import java.util.UUID;

public record ConfirmAdvancementRequest(
        List<UUID> advancedTeamIds,
        @Valid List<AdvancementOverrideRequest> overrides,
        @Size(max = 500) String note
) {
}
