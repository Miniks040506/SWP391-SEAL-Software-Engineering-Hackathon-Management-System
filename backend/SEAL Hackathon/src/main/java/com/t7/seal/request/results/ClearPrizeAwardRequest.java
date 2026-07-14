package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "ClearPrizeAwardRequest", description = "Request payload for clear prize award.")
public record ClearPrizeAwardRequest(
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation."
        )
        String reason
) {}