package com.t7.seal.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

public record CreateGuestJudgeRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 200) String affiliation,
        @Size(max = 500) String expertise,
        LocalDateTime temporaryAccountExpiresAt
) {}
