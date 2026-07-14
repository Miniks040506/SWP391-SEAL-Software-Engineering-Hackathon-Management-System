package com.t7.seal.request.system;

import com.t7.seal.domain.NotificationTargetScope;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "UpdateAnnouncementRequest", description = "Request payload for update announcement.")
public record UpdateAnnouncementRequest(
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder"
        )
        String title,
        @Schema(
                description = "Business content or page content collection, depending on the DTO.",
                example = "content example"
        )
        String content,
        @Schema(
                description = "Client-supplied value for pinned.",
                example = "true"
        )
        Boolean pinned,
        @Schema(
                description = "Client-supplied value for result announcement.",
                example = "true"
        )
        Boolean resultAnnouncement,
        @Schema(
                description = "Client-supplied value for send email.",
                example = "true"
        )
        Boolean sendEmail,
        @Schema(
                description = "Client-supplied value for send in app.",
                example = "true"
        )
        Boolean sendInApp,
        @Schema(
                description = "Timestamp for scheduled.",
                example = "2027-08-25T08:00:00",
                format = "date-time"
        )
        LocalDateTime scheduledAt,
        @Schema(
                description = "Client-supplied value for target scope.",
                example = "ALL"
        )
        NotificationTargetScope targetScope,
        @Schema(
                description = "UUID reference to the target.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid"
        )
        UUID targetId,
        @Schema(
                description = "Collection of target track ids."
        )
        List<UUID> targetTrackIds,
        @Schema(
                description = "Collection of target role names."
        )
        List<String> targetRoleNames
) {}

