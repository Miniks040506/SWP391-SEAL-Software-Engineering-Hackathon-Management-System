package com.t7.seal.exception;

import lombok.Getter;
import org.springframework.http.HttpStatus;

@Getter
public class ProviderIntegrationException extends RuntimeException {

    private final HttpStatus status;
    private final String code;

    public ProviderIntegrationException(HttpStatus status, String code, String message) {
        super(message);
        this.status = status;
        this.code = code;
    }

    public static ProviderIntegrationException unavailable(String message) {
        return new ProviderIntegrationException(
                HttpStatus.SERVICE_UNAVAILABLE,
                "GOOGLE_DRIVE_UNAVAILABLE",
                message
        );
    }

    public static ProviderIntegrationException revoked() {
        return new ProviderIntegrationException(
                HttpStatus.UNAUTHORIZED,
                "GOOGLE_DRIVE_AUTHORIZATION_INVALID",
                "Google Drive authorization expired or was revoked. Connect Google Drive again."
        );
    }

    public static ProviderIntegrationException forbidden() {
        return new ProviderIntegrationException(
                HttpStatus.FORBIDDEN,
                "GOOGLE_DRIVE_PERMISSION_DENIED",
                "Google Drive denied access to the requested resource."
        );
    }

    public static ProviderIntegrationException rateLimited() {
        return new ProviderIntegrationException(
                HttpStatus.TOO_MANY_REQUESTS,
                "GOOGLE_DRIVE_RATE_LIMITED",
                "Google Drive rate limit reached. Wait briefly and try again."
        );
    }

    public static ProviderIntegrationException invalidResponse() {
        return new ProviderIntegrationException(
                HttpStatus.BAD_GATEWAY,
                "GOOGLE_DRIVE_INVALID_RESPONSE",
                "Google Drive returned an incomplete response. Try connecting again."
        );
    }

    public static ProviderIntegrationException notConnected() {
        return new ProviderIntegrationException(
                HttpStatus.CONFLICT,
                "GOOGLE_DRIVE_NOT_CONNECTED",
                "Connect Google Drive before choosing a file."
        );
    }
}
