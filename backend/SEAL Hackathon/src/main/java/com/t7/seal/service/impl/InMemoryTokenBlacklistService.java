package com.t7.seal.service.impl;

import com.t7.seal.service.TokenBlacklistService;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.Iterator;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class InMemoryTokenBlacklistService implements TokenBlacklistService {

    /**
     * Key   = JWT token
     * Value = expiration timestamp in milliseconds
     */
    private final Map<String, Long> blacklistedTokens = new ConcurrentHashMap<>();

    @Override
    public boolean isBlacklisted(String token) {
        if (token == null || token.isBlank()) {
            return false;
        }

        cleanupExpiredTokens();

        Long expiresAt = blacklistedTokens.get(token);

        if (expiresAt == null) {
            return false;
        }

        return expiresAt > Instant.now().toEpochMilli();
    }

    @Override
    public void blacklist(String token) {
        if (token == null || token.isBlank()) {
            return;
        }

        long expiresAt = Instant.now()
                .plusSeconds(24 * 60 * 60)
                .toEpochMilli();

        blacklistedTokens.put(token, expiresAt);
    }

    @Override
    public void blacklist(String token, long expiresAtMillis) {
        if (token == null || token.isBlank()) {
            return;
        }

        blacklistedTokens.put(token, expiresAtMillis);
    }

    private void cleanupExpiredTokens() {
        long now = Instant.now().toEpochMilli();

        Iterator<Map.Entry<String, Long>> iterator =
                blacklistedTokens.entrySet().iterator();

        while (iterator.hasNext()) {
            Map.Entry<String, Long> entry = iterator.next();

            if (entry.getValue() <= now) {
                iterator.remove();
            }
        }
    }
}