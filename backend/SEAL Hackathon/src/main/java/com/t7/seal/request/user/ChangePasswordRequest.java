package com.t7.seal.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(name = "ChangePasswordRequest", description = "Request payload for change password.")
public record ChangePasswordRequest(
        @Schema(
                description = "Current password used to verify the authenticated user.",
                example = "Password@123",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String currentPassword,
        @Schema(
                description = "New password that must satisfy the password policy.",
                example = "NewPassword@123",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).*$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
        String newPassword,
        @Schema(
                description = "Confirmation value that must match the new password.",
                example = "NewPassword@123",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(min = 8, max = 100) String confirmPassword
) {}
