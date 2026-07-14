package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ReasonRequest", description = "Request payload for reason.")
public record ReasonRequest(
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation."
        )
        String reason
) {}