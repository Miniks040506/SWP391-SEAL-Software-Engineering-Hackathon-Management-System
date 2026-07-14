package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "NotificationRecipientResponse", description = "Response payload for notification recipient.")
public record NotificationRecipientResponse(
        @Schema(
                description = "User UUID.",
                example = "18000000-0000-4000-8000-000000000001",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID userId,
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fullName,
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String email,
        @Schema(
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String role,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SCHEDULED", "PROCESSING", "SENT", "PARTIALLY_FAILED", "FAILED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for delivery role.",
                example = "delivery role example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String deliveryRole
) {
}
