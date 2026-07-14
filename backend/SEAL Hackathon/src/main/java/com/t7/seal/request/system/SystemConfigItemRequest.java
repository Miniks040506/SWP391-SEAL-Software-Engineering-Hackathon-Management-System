package com.t7.seal.request.system;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "SystemConfigItemRequest", description = "Request payload for system config item.")
public record SystemConfigItemRequest(
        @Schema(
                description = "Client-supplied value for key.",
                example = "key example",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String key,
        @Schema(
                description = "Business value or score value.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Object value,
        @Schema(
                description = "Client-supplied value for encrypted.",
                example = "true"
        )
        Boolean encrypted,
        @Schema(
                description = "Client-supplied value for category.",
                example = "GENERAL"
        )
        String category,
        @Schema(
                description = "Client-supplied value for value type.",
                example = "STRING",
                allowableValues = {"STRING", "INTEGER", "BOOLEAN", "JSON"}
        )
        String valueType,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description,
        @Schema(
                description = "Whether the resource is active.",
                example = "true"
        )
        Boolean active
) {}
