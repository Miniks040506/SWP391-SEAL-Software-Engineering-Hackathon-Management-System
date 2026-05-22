package com.t7.seal.response.auth;

public record RefreshTokenResponse(
        String accessToken,
        String refreshToken,
        long accessTokenExpiresInMs,
        long refreshTokenExpiresInMs
) {}