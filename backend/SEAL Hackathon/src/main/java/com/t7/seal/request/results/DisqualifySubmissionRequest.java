package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "DisqualifySubmissionRequest", description = "Request payload for disqualify submission.")
public record DisqualifySubmissionRequest(
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String reason,
        @Schema(
                description = "Client-supplied value for evidence url.",
                example = "https://example.test/resource"
        )
        String evidenceUrl
) {}
