package com.t7.seal.response;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;
import java.util.List;

@Schema(name = "ApiErrorResponse", description = "Response payload for api error.")
public record ApiErrorResponse(
        @Schema(
                description = "Whether the request completed successfully.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean success,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int status,
        @Schema(
                description = "HTTP error reason phrase.",
                example = "Bad Request",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String error,
        @Schema(
                description = "Client-safe response message.",
                example = "Request validation failed",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String message,
        @Schema(
                description = "Request path that produced the response.",
                example = "/api/v1/events",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String path,
        @Schema(
                description = "Timestamp when the response was produced.",
                example = "2027-08-25T01:00:00Z",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Instant timestamp,
        @Schema(
                description = "Field-level validation errors.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<FieldErrorResponse> fieldErrors
) {
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(false, status, error, message, path, Instant.now(), List.of());
    }
}