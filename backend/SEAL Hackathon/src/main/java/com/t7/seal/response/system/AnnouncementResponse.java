package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "AnnouncementResponse", description = "Response payload for announcement.")
public record AnnouncementResponse(
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
                description = "Human-readable title.",
                example = "Submission deadline reminder",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String title,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String content,
        @Schema(
                description = "API-returned value for pinned.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean pinned,
        @Schema(
                description = "API-returned value for result announcement.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean resultAnnouncement,
        @Schema(
                description = "Timestamp for published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime publishedAt,
        @Schema(
                description = "API-returned value for created by.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID createdBy,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SCHEDULED", "PUBLISHED", "CANCELLED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for send email.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean sendEmail,
        @Schema(
                description = "API-returned value for send in app.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean sendInApp,
        @Schema(
                description = "Timestamp for scheduled.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime scheduledAt,
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
                description = "Collection of target track ids.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<UUID> targetTrackIds,
        @Schema(
                description = "Collection of target role names.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<String> targetRoleNames
) {
}