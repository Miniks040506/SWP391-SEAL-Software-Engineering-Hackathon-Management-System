package com.t7.seal.request.system;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Schema(name = "CreateExportJobRequest", description = "Request payload for create export job.")
public record CreateExportJobRequest(
        @Schema(
                description = "Client-supplied value for export type.",
                example = "GENERAL",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String exportType,
        @Schema(
                description = "Client-supplied value for params.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Object params
) {}