package com.t7.seal.response.user;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "UserDetailResponse", description = "Response payload for user detail.")
public record UserDetailResponse(
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
                description = "Contact phone number.",
                example = "0901234567",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String phone,
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
                description = "User avatar URL.",
                example = "https://example.test/avatar.png",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String avatarUrl,
        @Schema(
                description = "Timestamp for email verified.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime emailVerifiedAt,
        @Schema(
                description = "Timestamp for last login.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime lastLoginAt,
        @Schema(
                description = "API-returned value for role profile.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Object roleProfile
) {
}