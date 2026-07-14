package com.t7.seal.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "CreateUserRequest", description = "Request payload for create user.")
public record CreateUserRequest(
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String email,
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 200) String fullName,
        @Schema(
                description = "Contact phone number.",
                example = "0901234567"
        )
        @Size(max = 20) String phone,
        @Schema(
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String role,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "ACTIVE",
                allowableValues = {"UNVERIFIED", "PENDING_APPROVAL", "ACTIVE", "SUSPENDED", "DEACTIVATED"},
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String status
) {}