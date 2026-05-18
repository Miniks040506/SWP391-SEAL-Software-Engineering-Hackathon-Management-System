package com.t7.seal.service;

import org.springframework.security.core.userdetails.UserDetails;

public interface JwtService {

    String extractUsername(String token);

    boolean isTokenValid(String token, UserDetails userDetails);

    String generateAccessToken(UserDetails userDetails);

    String generateRefreshToken(UserDetails userDetails);

    long getAccessTokenExpirationMs();

    long getRefreshTokenExpirationMs();

    long extractExpirationMillis(String token);
}