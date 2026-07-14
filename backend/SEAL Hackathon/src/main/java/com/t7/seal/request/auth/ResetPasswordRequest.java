package com.t7.seal.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Schema(name = "ResetPasswordRequest", description = "Request payload for reset password.")
public record ResetPasswordRequest(
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String email,
        @Schema(
                description = "Client-supplied value for code.",
                example = "code example",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Pattern(regexp = "\\d{6}", message = "Reset code must contain exactly 6 digits.")
        String code,
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
