package com.t7.seal.request.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.math.BigDecimal;
import java.util.UUID;

@Schema(name = "UpdatePrizeRequest", description = "Request payload for update prize.")
public record UpdatePrizeRequest(
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid"
        )
        UUID eventId,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid"
        )
        UUID trackId,
        @Schema(
                description = "Ranking position.",
                example = "1"
        )
        Integer rankPosition,
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder"
        )
        String title,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description,
        @Schema(
                description = "Business value or score value.",
                example = "8.5"
        )
        BigDecimal value,
        @Schema(
                description = "Client-supplied value for currency.",
                example = "VND"
        )
        String currency,
        @Schema(
                description = "Client-supplied value for sponsor name.",
                example = "sponsor name example"
        )
        String sponsorName
) {}