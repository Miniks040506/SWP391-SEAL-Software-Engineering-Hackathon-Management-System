package com.t7.seal.request.event;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Digits;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Schema(name = "CreateEventRequest", description = "Request payload for create event.")
public record CreateEventRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 200) String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        @Size(max = 2000) String description,
        @Schema(
                description = "Client-supplied value for season.",
                example = "SUMMER",
                allowableValues = {"SPRING", "SUMMER", "FALL"},
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String season,
        @Schema(
                description = "Client-supplied value for year.",
                example = "2027",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Integer year,
        @Schema(
                description = "Registration opening timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time"
        )
        LocalDateTime registrationStartAt,
        @Schema(
                description = "Registration closing timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime registrationEndAt,
        @Schema(
                description = "Competition start timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time"
        )
        LocalDateTime competitionStartAt,
        @Schema(
                description = "Competition end timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime competitionEndAt,
        @Schema(
                description = "Client-supplied value for variance threshold points.",
                example = "8.5"
        )
        @DecimalMin(value = "0.0", inclusive = false)
        @Digits(integer = 6, fraction = 2)
        BigDecimal varianceThresholdPoints,
        @Schema(
                description = "Event banner URL.",
                example = "https://example.test/banner.png"
        )
        String bannerUrl,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "REGISTRATION",
                allowableValues = {"DRAFT", "REGISTRATION", "ONGOING", "JUDGING", "COMPLETED", "CANCELLED", "ARCHIVED"}
        )
        String status
) {}
