package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "AssignPrizesFromRankingRequest", description = "Request payload for assign prizes from ranking.")
public record AssignPrizesFromRankingRequest(
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
                description = "Client-supplied value for overwrite existing awards.",
                example = "true"
        )
        Boolean overwriteExistingAwards,
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
