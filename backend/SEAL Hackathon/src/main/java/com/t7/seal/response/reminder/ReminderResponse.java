package com.t7.seal.response.reminder;

import java.time.LocalDateTime;
import java.util.UUID;

public record ReminderResponse(
        UUID id,
        UUID eventId,
        String eventName,
        String type,
        String title,
        String body,
        String targetScope,
        UUID targetId,
        String channel,
        String status,
        LocalDateTime scheduledAt,
        LocalDateTime sentAt,
        Integer recipientCount
) {}
