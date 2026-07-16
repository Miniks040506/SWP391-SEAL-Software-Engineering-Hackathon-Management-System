package com.t7.seal.security;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.ExternalProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import java.net.URI;
import java.nio.charset.StandardCharsets;
import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.security.SecureRandom;
import java.time.Duration;
import java.time.Instant;
import java.util.Base64;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProviderOAuthStateCodec {

    private static final Duration STATE_LIFETIME = Duration.ofMinutes(5);
    private static final int RANDOM_BYTES = 32;

    private final ProviderCredentialCipher cipher;
    private final ObjectMapper objectMapper;
    private final SecureRandom secureRandom = new SecureRandom();

    public IssuedState issue(
            UUID userId,
            ExternalProvider provider,
            String requestedReturnPath
    ) {
        if (userId == null || provider == null) {
            throw new IllegalArgumentException("User and provider are required.");
        }

        String returnPath = safeReturnPath(requestedReturnPath);
        String verifier = randomUrlSafeValue();
        String browserNonce = randomUrlSafeValue();
        Instant expiresAt = Instant.now().plus(STATE_LIFETIME);
        Payload payload = new Payload(
                userId,
                provider,
                returnPath,
                verifier,
                browserNonce,
                expiresAt
        );

        try {
            String token = cipher.encryptOAuthState(objectMapper.writeValueAsString(payload));
            return new IssuedState(
                    token,
                    browserNonce,
                    sha256Challenge(verifier),
                    expiresAt
            );
        } catch (JsonProcessingException exception) {
            throw new IllegalStateException("Unable to create OAuth state.", exception);
        }
    }

    public VerifiedState verify(
            String stateToken,
            String browserNonce,
            ExternalProvider expectedProvider
    ) {
        if (stateToken == null || stateToken.isBlank()) {
            throw new IllegalArgumentException("OAuth state is required.");
        }
        if (browserNonce == null || browserNonce.isBlank()) {
            throw new IllegalArgumentException("OAuth browser binding is missing.");
        }
        if (expectedProvider == null) {
            throw new IllegalArgumentException("Expected provider is required.");
        }

        try {
            Payload payload = objectMapper.readValue(
                    cipher.decryptOAuthState(stateToken),
                    Payload.class
            );
            validatePayload(payload, browserNonce, expectedProvider);
            return new VerifiedState(
                    payload.userId(),
                    payload.provider(),
                    payload.returnPath(),
                    payload.codeVerifier()
            );
        } catch (JsonProcessingException | IllegalStateException exception) {
            throw new IllegalArgumentException("OAuth state is invalid.", exception);
        }
    }

    private void validatePayload(
            Payload payload,
            String browserNonce,
            ExternalProvider expectedProvider
    ) {
        if (payload.userId() == null || payload.provider() != expectedProvider) {
            throw new IllegalArgumentException("OAuth state does not match this provider.");
        }
        if (payload.expiresAt() == null || !Instant.now().isBefore(payload.expiresAt())) {
            throw new IllegalArgumentException("OAuth state has expired. Start the connection again.");
        }
        if (!constantTimeEquals(payload.browserNonce(), browserNonce)) {
            throw new IllegalArgumentException("OAuth state does not match this browser.");
        }
        if (payload.codeVerifier() == null || payload.codeVerifier().length() < 43) {
            throw new IllegalArgumentException("OAuth PKCE verifier is invalid.");
        }
        safeReturnPath(payload.returnPath());
    }

    private String safeReturnPath(String value) {
        String path = value == null || value.isBlank() ? "/" : value.trim();
        if (path.length() > 500
                || !path.startsWith("/")
                || path.startsWith("//")
                || path.contains("\\")
                || path.contains("\r")
                || path.contains("\n")) {
            throw new IllegalArgumentException("OAuth return path must be a safe local path.");
        }
        URI uri = URI.create(path);
        if (uri.isAbsolute() || uri.getRawAuthority() != null) {
            throw new IllegalArgumentException("OAuth return path must stay on this application.");
        }
        return path;
    }

    private String randomUrlSafeValue() {
        byte[] value = new byte[RANDOM_BYTES];
        secureRandom.nextBytes(value);
        return Base64.getUrlEncoder().withoutPadding().encodeToString(value);
    }

    private String sha256Challenge(String verifier) {
        try {
            byte[] digest = MessageDigest.getInstance("SHA-256")
                    .digest(verifier.getBytes(StandardCharsets.US_ASCII));
            return Base64.getUrlEncoder().withoutPadding().encodeToString(digest);
        } catch (NoSuchAlgorithmException exception) {
            throw new IllegalStateException("SHA-256 is unavailable.", exception);
        }
    }

    private boolean constantTimeEquals(String expected, String actual) {
        if (expected == null || actual == null) {
            return false;
        }
        return MessageDigest.isEqual(
                expected.getBytes(StandardCharsets.US_ASCII),
                actual.getBytes(StandardCharsets.US_ASCII)
        );
    }

    private record Payload(
            UUID userId,
            ExternalProvider provider,
            String returnPath,
            String codeVerifier,
            String browserNonce,
            Instant expiresAt
    ) {
    }

    public record IssuedState(
            String stateToken,
            String browserNonce,
            String codeChallenge,
            Instant expiresAt
    ) {
    }

    public record VerifiedState(
            UUID userId,
            ExternalProvider provider,
            String returnPath,
            String codeVerifier
    ) {
    }
}
