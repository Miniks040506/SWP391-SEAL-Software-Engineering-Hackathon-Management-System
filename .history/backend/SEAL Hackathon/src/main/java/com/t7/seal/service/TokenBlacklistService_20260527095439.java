package com.t7.seal.service;

public interface TokenBlacklistService {

    boolean isBlacklisted(String token);

    void blacklist(String token);

    void blacklist(String token, long expiresAtMillis);
}
