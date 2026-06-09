package com.t7.seal.request.system;

import com.t7.seal.domain.NotificationTargetScope;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record UpdateAnnouncementRequest(
        String title,
        String content,
        Boolean pinned,
        Boolean resultAnnouncement,
        Boolean sendEmail,
        Boolean sendInApp,
        LocalDateTime scheduledAt,
        NotificationTargetScope targetScope,
        UUID targetId,
        List<UUID> targetTrackIds,
        List<String> targetRoleNames
) {}

