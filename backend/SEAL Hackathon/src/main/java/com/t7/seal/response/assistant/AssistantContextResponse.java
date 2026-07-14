package com.t7.seal.response.assistant;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Schema(name = "AssistantContextResponse", description = "Response payload for assistant context.")
public record AssistantContextResponse(
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
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String role,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Collection of quick prompts.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<String> quickPrompts,
        @Schema(
                description = "API-returned value for role context.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Map<String, Object> roleContext
) {
}