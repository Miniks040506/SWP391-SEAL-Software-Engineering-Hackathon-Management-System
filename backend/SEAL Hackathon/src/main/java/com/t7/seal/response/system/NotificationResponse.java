package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record NotificationResponse(
        UUID id, UUID eventId, String type, String title, String body, String targetScope,
        UUID targetId, String channel, String status,
        LocalDateTime scheduledAt,
        LocalDateTime sentAt,
        String targetUrl,
        Boolean read
) {}
