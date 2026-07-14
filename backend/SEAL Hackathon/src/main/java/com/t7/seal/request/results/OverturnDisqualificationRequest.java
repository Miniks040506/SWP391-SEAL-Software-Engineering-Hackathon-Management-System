package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "OverturnDisqualificationRequest", description = "Request payload for overturn disqualification.")
public record OverturnDisqualificationRequest(
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String reason
) {}
