package com.t7.seal.request.reminder;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "CreateReminderRequest", description = "Request payload for create reminder.")
public record CreateReminderRequest(
        @Schema(
                description = "Business type or discriminator.",
                example = "GENERAL",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String type,
        @Schema(
                description = "Human-readable title.",
                example = "Submission deadline reminder",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String title,
        @Schema(
                description = "Client-supplied value for body.",
                example = "body example",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String body,
        @Schema(
                description = "Client-supplied value for target scope.",
                example = "ALL_EVENT_USERS",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String targetScope,
        @Schema(
                description = "UUID reference to the target.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid"
        )
        UUID targetId,
        @Schema(
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"}
        )
        String role,
        @Schema(
                description = "Client-supplied value for channel.",
                example = "BOTH"
        )
        String channel,
        @Schema(
                description = "Timestamp for scheduled.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull LocalDateTime scheduledAt
) {}
