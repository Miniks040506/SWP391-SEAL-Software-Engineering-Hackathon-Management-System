package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "EmailOutboxResponse", description = "Response payload for email outbox.")
public record EmailOutboxResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "UUID reference to the notification.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID notificationId,
        @Schema(
                description = "API-returned value for to email.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String toEmail,
        @Schema(
                description = "API-returned value for cc emails.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String ccEmails,
        @Schema(
                description = "API-returned value for subject.",
                example = "subject example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String subject,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Number of attempt.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer attemptCount,
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
                description = "API-returned value for last error.",
                example = "last error example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String lastError
) {
}