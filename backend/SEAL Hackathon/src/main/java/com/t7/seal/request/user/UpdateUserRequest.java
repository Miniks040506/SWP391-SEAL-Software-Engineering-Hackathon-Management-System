package com.t7.seal.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

@Schema(name = "UpdateUserRequest", description = "Request payload for update user.")
public record UpdateUserRequest(
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An"
        )
        @Size(max = 200) String fullName,
        @Schema(
                description = "Contact phone number.",
                example = "0901234567"
        )
        @Size(max = 20) String phone,
        @Schema(
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"}
        )
        String role,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"}
        )
        String status,
        @Schema(
                description = "User avatar URL.",
                example = "https://example.test/avatar.png"
        )
        String avatarUrl
) {}
