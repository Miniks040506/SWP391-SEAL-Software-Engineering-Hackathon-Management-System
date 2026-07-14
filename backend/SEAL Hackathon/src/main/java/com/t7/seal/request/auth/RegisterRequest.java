package com.t7.seal.request.auth;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

@Schema(name = "RegisterRequest", description = "Request payload for register.")
public record RegisterRequest(
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String email,
        @Schema(
                description = "Plain-text password accepted only in the request; it must never be logged or returned.",
                example = "Password@123",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank
        @Size(min = 8, max = 100)
        @Pattern(
                regexp = "^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)(?=.*[^A-Za-z0-9]).*$",
                message = "Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character."
        )
        String password,
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
                description = "Client-supplied value for student type.",
                example = "FPT",
                allowableValues = {"FPT", "EXTERNAL"},
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String studentType,
        @Schema(
                description = "Client-supplied value for student code.",
                example = "SE123456"
        )
        @Size(max = 50) String studentCode,
        @Schema(
                description = "Client-supplied value for university name.",
                example = "FPT University"
        )
        @Size(max = 200) String universityName,
        @Schema(
                description = "Client-supplied value for major.",
                example = "Software Engineering"
        )
        @Size(max = 200) String major,
        @Schema(
                description = "Client-supplied value for graduation year.",
                example = "2027"
        )
        Integer graduationYear
) {}
