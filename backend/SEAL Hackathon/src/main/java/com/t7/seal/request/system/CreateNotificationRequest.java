package com.t7.seal.request.system;

import jakarta.validation.constraints.NotBlank;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateNotificationRequest(
        UUID eventId, @NotBlank String type, @NotBlank String title,
        @NotBlank String body, @NotBlank String targetScope,
        UUID targetId, String role, String channel, LocalDateTime scheduledAt
) {}
