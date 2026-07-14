package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "AwardPrizeRequest", description = "Request payload for award prize.")
public record AwardPrizeRequest(
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID teamId,
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation."
        )
        String reason,
        @Schema(
                description = "Client-supplied value for send notification.",
                example = "true"
        )
        Boolean sendNotification,
        @Schema(
                description = "Client-supplied value for send in app.",
                example = "true"
        )
        Boolean sendInApp,
        @Schema(
                description = "Client-supplied value for send email.",
                example = "true"
        )
        Boolean sendEmail
) {}
