package com.t7.seal.response.user;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "UserApprovalResponse", description = "Response payload for user approval.")
public record UserApprovalResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String email,
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fullName,
        @Schema(
                description = "API-returned value for student type.",
                example = "FPT",
                allowableValues = {"FPT", "EXTERNAL"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String studentType,
        @Schema(
                description = "API-returned value for university name.",
                example = "FPT University",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String universityName,
        @Schema(
                description = "Timestamp for email verified.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime emailVerifiedAt
) {
}