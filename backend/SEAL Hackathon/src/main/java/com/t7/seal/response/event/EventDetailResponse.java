package com.t7.seal.response.event;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.response.round.RoundResponse;
import com.t7.seal.response.track.TrackResponse;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "EventDetailResponse", description = "Response payload for event detail.")
public record EventDetailResponse(
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
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
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
                description = "Registration opening timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime registrationStartAt,
        @Schema(
                description = "Registration closing timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime registrationEndAt,
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
        LocalDateTime competitionEndAt,
        @Schema(
                description = "Timestamp for result published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime resultPublishedAt,
        @Schema(
                description = "API-returned value for variance threshold points.",
                example = "8.5",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        BigDecimal varianceThresholdPoints,
        @Schema(
                description = "Collection of tracks.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<TrackResponse> tracks,
        @Schema(
                description = "Collection of rounds.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<RoundResponse> rounds
) {
}