package com.t7.seal.response.results;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "PrizeAssignmentResponse", description = "Response payload for prize assignment.")
public record PrizeAssignmentResponse(
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
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "Number of prize.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer prizeCount,
        @Schema(
                description = "Number of awarded.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer awardedCount,
        @Schema(
                description = "Number of skipped.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer skippedCount,
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
                description = "Timestamp for assigned.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime assignedAt,
        @Schema(
                description = "Collection of prizes.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<PrizeResponse> prizes
) {
}