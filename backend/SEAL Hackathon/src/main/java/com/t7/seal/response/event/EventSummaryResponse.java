package com.t7.seal.response.event;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "EventSummaryResponse", description = "Response payload for event summary.")
public record EventSummaryResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String name,
        @Schema(
                description = "API-returned value for season.",
                example = "SUMMER",
                allowableValues = {"SPRING", "SUMMER", "FALL"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String season,
        @Schema(
                description = "API-returned value for year.",
                example = "2027",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer year,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "REGISTRATION",
                allowableValues = {"DRAFT", "REGISTRATION", "ONGOING", "JUDGING", "COMPLETED", "CANCELLED", "ARCHIVED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Event banner URL.",
                example = "https://example.test/banner.png",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String bannerUrl,
        @Schema(
                description = "Competition start timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime competitionStartAt,
        @Schema(
                description = "Competition end timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime competitionEndAt
) {
}