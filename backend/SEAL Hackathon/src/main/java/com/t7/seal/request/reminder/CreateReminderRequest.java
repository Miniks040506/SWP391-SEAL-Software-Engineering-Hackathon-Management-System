package com.t7.seal.request.reminder;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

public record CreateReminderRequest(
        @NotBlank String type,
        @NotBlank String title,
        @NotBlank String body,
        @NotBlank String targetScope,
        UUID targetId,
        String role,
        String channel,
        @NotNull LocalDateTime scheduledAt
) {}
