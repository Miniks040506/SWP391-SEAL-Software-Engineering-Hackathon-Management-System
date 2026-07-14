package com.t7.seal.request.system;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

@Schema(name = "TestEmailRequest", description = "Request payload for test email.")
public record TestEmailRequest(
        @Schema(
                description = "Client-supplied value for to.",
                example = "to example",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Email String to,
        @Schema(
                description = "Client-supplied value for subject.",
                example = "subject example"
        )
        String subject,
        @Schema(
                description = "Client-supplied value for body.",
                example = "body example"
        )
        String body
) {}
