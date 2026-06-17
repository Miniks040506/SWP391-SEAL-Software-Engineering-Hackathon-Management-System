package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record EmailOutboxResponse(
        UUID id,
        UUID notificationId,
        String toEmail,
        String ccEmails,
        String subject,
        String status,
        Integer attemptCount,
        LocalDateTime scheduledAt,
        LocalDateTime sentAt,
        String lastError
) {}
