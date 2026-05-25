package com.t7.seal.response.auth;

import java.util.UUID;

public record RegisterResponse(
        UUID userId,
        String email,
        String status,
        Integer verificationExpiresInSeconds,
        String message
) {}
