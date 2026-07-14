package com.t7.seal.response.system;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "NotificationRecipientResolutionResponse", description = "Response payload for notification recipient resolution.")
public record NotificationRecipientResolutionResponse(
        @Schema(
                description = "API-returned value for target scope.",
                example = "ALL_EVENT_USERS",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String targetScope,
        @Schema(
                description = "UUID reference to the target.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID targetId,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String role,
        @Schema(
                description = "API-returned value for total recipients.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int totalRecipients,
        @Schema(
                description = "API-returned value for primary recipient.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        NotificationRecipientResponse primaryRecipient,
        @Schema(
                description = "Collection of to.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<NotificationRecipientResponse> to,
        @Schema(
                description = "Collection of cc.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<NotificationRecipientResponse> cc,
        @Schema(
                description = "Collection of in app recipients.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<NotificationRecipientResponse> inAppRecipients
) {
}