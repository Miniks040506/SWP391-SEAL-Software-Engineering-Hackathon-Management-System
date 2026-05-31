package com.t7.seal.response.auth;

import java.util.UUID;

public record LoginResponse(
        UUID userId,
        String email,
        String fullName,
        String role,
        String status,
        String avatarUrl,
        String accessToken,
        String refreshToken,
        long accessTokenExpiresInMs,
        long refreshTokenExpiresInMs
) {}