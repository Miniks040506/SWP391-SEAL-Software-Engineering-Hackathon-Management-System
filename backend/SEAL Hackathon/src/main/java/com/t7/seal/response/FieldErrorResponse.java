package com.t7.seal.response;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "FieldErrorResponse", description = "Response payload for field error.")
public record FieldErrorResponse(
        @Schema(
                description = "API-returned value for field.",
                example = "field example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String field,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message
) {
}