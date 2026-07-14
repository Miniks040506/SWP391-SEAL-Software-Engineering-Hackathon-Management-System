package com.t7.seal.response.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "PublishResultsResponse", description = "Response payload for publish results.")
public record PublishResultsResponse(
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "Timestamp for published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime publishedAt,
        @Schema(
                description = "UUID reference to the announcement.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID announcementId,
        @Schema(
                description = "Number of notified.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int notifiedCount,
        @Schema(
                description = "API-returned value for notification sent.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean notificationSent,
        @Schema(
                description = "API-returned value for email queued.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean emailQueued,
        @Schema(
                description = "Number of published ranking.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int publishedRankingCount
) {
}