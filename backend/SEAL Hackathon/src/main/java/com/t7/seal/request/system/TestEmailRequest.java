package com.t7.seal.request.system;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record TestEmailRequest(
        @NotBlank @Email String to,
        String subject,
        String body
) {}
