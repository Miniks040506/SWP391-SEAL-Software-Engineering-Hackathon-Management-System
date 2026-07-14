package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "NotificationResponse", description = "Response payload for notification.")
public record NotificationResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "Business type or discriminator.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String type,
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String title,
        @Schema(
                description = "API-returned value for body.",
                example = "body example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String body,
        @Schema(
                description = "API-returned value for target scope.",
                example = "ALL_EVENT_USERS",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String targetScope,
        @Schema(
                description = "UUID reference to the target.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID targetId,
        @Schema(
                description = "API-returned value for channel.",
                example = "BOTH",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String channel,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SCHEDULED", "PROCESSING", "SENT", "PARTIALLY_FAILED", "FAILED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Timestamp for scheduled.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime scheduledAt,
        @Schema(
                description = "Timestamp for sent.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime sentAt,
        @Schema(
                description = "API-returned value for target url.",
                example = "https://example.test/resource",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String targetUrl,
        @Schema(
                description = "API-returned value for read.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean read
) {
}