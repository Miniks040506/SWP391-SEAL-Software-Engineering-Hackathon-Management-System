package com.t7.seal.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(name = "CreateGuestJudgeRequest", description = "Request payload for create guest judge.")
public record CreateGuestJudgeRequest(
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
                description = "Client-supplied value for affiliation.",
                example = "affiliation example"
        )
        @Size(max = 200) String affiliation,
        @Schema(
                description = "Client-supplied value for expertise.",
                example = "expertise example"
        )
        @Size(max = 500) String expertise,
        @Schema(
                description = "Timestamp for temporary account expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime temporaryAccountExpiresAt
) {}
