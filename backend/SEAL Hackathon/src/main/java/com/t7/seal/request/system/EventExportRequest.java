package com.t7.seal.request.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "EventExportRequest", description = "Request payload for event export.")
public record EventExportRequest(
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
        String format,
        @Schema(
                description = "Client-supplied value for include draft scores.",
                example = "true"
        )
        Boolean includeDraftScores,
        @Schema(
                description = "Client-supplied value for include disqualified.",
                example = "true"
        )
        Boolean includeDisqualified,
        @Schema(
                description = "Client-supplied value for anonymize.",
                example = "true"
        )
        Boolean anonymize
) {}
