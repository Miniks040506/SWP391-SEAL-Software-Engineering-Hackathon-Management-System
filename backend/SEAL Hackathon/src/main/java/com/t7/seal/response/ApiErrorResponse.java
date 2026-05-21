package com.t7.seal.response;

import java.time.Instant;
import java.util.List;

public record ApiErrorResponse(
        boolean success,
        int status,
        String error,
        String message,
        String path,
        Instant timestamp,
        List<FieldErrorResponse> fieldErrors
) {
    public static ApiErrorResponse of(int status, String error, String message, String path) {
        return new ApiErrorResponse(false, status, error, message, path, Instant.now(), List.of());
    }
}
