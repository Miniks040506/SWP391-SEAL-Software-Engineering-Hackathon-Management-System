package com.t7.seal.response.integration;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Current user's GitHub repository connection without provider credentials.")
public record GithubConnectionStatusResponse(
        @Schema(description = "Whether GitHub submission OAuth is configured and enabled.")
        boolean available,
        @Schema(description = "Actionable provider availability explanation.")
        String availabilityMessage,
        @Schema(description = "Whether the user has an active GitHub connection.")
        boolean connected,
        @Schema(description = "Stable GitHub account identifier, when connected.")
        String accountId,
        @Schema(description = "GitHub account e-mail when GitHub exposes it.")
        String accountEmail,
        @Schema(description = "Whether the connection granted access to private repositories.")
        boolean privateRepositoriesGranted,
        @Schema(description = "Most recent successful connection time.", format = "date-time")
        Instant connectedAt
) {
}
