package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "CreateDisqualificationRequest", description = "Request payload for create disqualification.")
public record CreateDisqualificationRequest(
        @Schema(
                description = "Submission UUID.",
                example = "18000000-0000-4000-8000-000000000801",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID submissionId,
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