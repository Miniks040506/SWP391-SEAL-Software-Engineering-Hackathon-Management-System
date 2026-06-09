package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record AnnouncementResponse(
        UUID id,
        UUID eventId,
        String title,
        String content,
        Boolean pinned,
        Boolean resultAnnouncement,
        LocalDateTime publishedAt,
        UUID createdBy,
        String status,
        Boolean sendEmail,
        Boolean sendInApp,
        LocalDateTime scheduledAt,
        String targetScope,
        UUID targetId,
        List<UUID> targetTrackIds,
        List<String> targetRoleNames
) {}