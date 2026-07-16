package com.t7.seal.security;

import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.domain.ExternalProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;

import javax.crypto.Cipher;
import javax.crypto.spec.GCMParameterSpec;
import javax.crypto.spec.SecretKeySpec;
import java.nio.ByteBuffer;
import java.nio.charset.StandardCharsets;
import java.security.GeneralSecurityException;
import java.security.SecureRandom;
import java.util.Base64;
import java.util.UUID;

@Component
@RequiredArgsConstructor
public class ProviderCredentialCipher {

    private static final String TRANSFORMATION = "AES/GCM/NoPadding";
    private static final String VERSION_PREFIX = "v1.";
    private static final int IV_LENGTH_BYTES = 12;
    private static final int TAG_LENGTH_BITS = 128;

    private final ProviderOAuthProperties properties;
    private final SecureRandom secureRandom = new SecureRandom();

    public String encrypt(UUID userId, ExternalProvider provider, String plaintext) {
        requireContext(userId, provider);
        if (plaintext == null || plaintext.isBlank()) {
            throw new IllegalArgumentException("Provider credential cannot be blank.");
        }

        byte[] iv = new byte[IV_LENGTH_BYTES];
        secureRandom.nextBytes(iv);
        try {
            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.ENCRYPT_MODE, encryptionKey(), new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            cipher.updateAAD(context(userId, provider));
            byte[] ciphertext = cipher.doFinal(plaintext.getBytes(StandardCharsets.UTF_8));
            byte[] payload = ByteBuffer.allocate(iv.length + ciphertext.length)
                    .put(iv)
                    .put(ciphertext)
                    .array();
            return VERSION_PREFIX + Base64.getUrlEncoder().withoutPadding().encodeToString(payload);
        } catch (GeneralSecurityException exception) {
            throw new IllegalStateException("Provider credential encryption failed.", exception);
        }
    }

    public String decrypt(UUID userId, ExternalProvider provider, String encryptedValue) {
        requireContext(userId, provider);
        if (encryptedValue == null || !encryptedValue.startsWith(VERSION_PREFIX)) {
            throw new IllegalArgumentException("Unsupported provider credential format.");
        }

        try {
            byte[] payload = Base64.getUrlDecoder().decode(
                    encryptedValue.substring(VERSION_PREFIX.length())
            );
            if (payload.length <= IV_LENGTH_BYTES) {
                throw new IllegalArgumentException("Invalid provider credential payload.");
            }
            ByteBuffer buffer = ByteBuffer.wrap(payload);
            byte[] iv = new byte[IV_LENGTH_BYTES];
            buffer.get(iv);
            byte[] ciphertext = new byte[buffer.remaining()];
            buffer.get(ciphertext);

            Cipher cipher = Cipher.getInstance(TRANSFORMATION);
            cipher.init(Cipher.DECRYPT_MODE, encryptionKey(), new GCMParameterSpec(TAG_LENGTH_BITS, iv));
            cipher.updateAAD(context(userId, provider));
            return new String(cipher.doFinal(ciphertext), StandardCharsets.UTF_8);
        } catch (GeneralSecurityException | IllegalArgumentException exception) {
            throw new IllegalStateException("Provider credential decryption failed.", exception);
        }
    }

    private SecretKeySpec encryptionKey() {
        if (!properties.hasValidEncryptionKey()) {
            throw new IllegalStateException(
                    "PROVIDER_CREDENTIAL_ENCRYPTION_KEY must be a Base64-encoded 32-byte key."
            );
        }
        return new SecretKeySpec(
                Base64.getDecoder().decode(properties.getCredentialEncryptionKey()),
                "AES"
        );
    }

    private byte[] context(UUID userId, ExternalProvider provider) {
        return (userId + ":" + provider.name()).getBytes(StandardCharsets.UTF_8);
    }

    private void requireContext(UUID userId, ExternalProvider provider) {
        if (userId == null || provider == null) {
            throw new IllegalArgumentException("User and provider are required.");
        }
    }
}
