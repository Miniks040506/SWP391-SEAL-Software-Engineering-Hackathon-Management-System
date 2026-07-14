package com.t7.seal.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "UpdateMyProfileRequest", description = "Request payload for update my profile.")
public record UpdateMyProfileRequest(
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
                description = "User avatar URL.",
                example = "https://example.test/avatar.png"
        )
        @Size(max = 500) String avatarUrl
) {}
