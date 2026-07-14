package com.t7.seal.response.auth;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "AuthMessageResponse", description = "Response payload for auth message.")
public record AuthMessageResponse(
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message
) {
}