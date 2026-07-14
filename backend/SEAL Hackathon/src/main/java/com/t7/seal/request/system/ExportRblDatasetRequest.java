package com.t7.seal.request.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "ExportRblDatasetRequest", description = "Request payload for export rbl dataset.")
public record ExportRblDatasetRequest(
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid"
        )
        UUID roundId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid"
        )
        UUID trackId,
        @Schema(
                description = "Client-supplied value for format.",
                example = "format example"
        )
        String format
) {}
