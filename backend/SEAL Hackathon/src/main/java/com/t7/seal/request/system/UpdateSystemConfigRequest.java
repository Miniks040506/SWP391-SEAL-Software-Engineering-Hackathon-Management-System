package com.t7.seal.request.system;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotEmpty;

import java.util.List;

@Schema(name = "UpdateSystemConfigRequest", description = "Request payload for update system config.")
public record UpdateSystemConfigRequest(
        @Schema(
                description = "Collection of items.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotEmpty List<SystemConfigItemRequest> items
) {}