package com.t7.seal.request.system;

import com.t7.seal.domain.NotificationTargetScope;
import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CreateAnnouncementRequest(
        @NotBlank String title,
        @NotBlank String content,
        Boolean pinned,
        Boolean resultAnnouncement,
        Boolean publishNow,
        Boolean sendEmail,
        Boolean sendInApp,
        LocalDateTime scheduledAt,
        NotificationTargetScope targetScope,
        UUID targetId,
        List<UUID> targetTrackIds,
        List<String> targetRoleNames
) {}
