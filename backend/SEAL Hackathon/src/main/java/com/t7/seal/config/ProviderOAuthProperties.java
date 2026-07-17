package com.t7.seal.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

@Component
@ConfigurationProperties(prefix = "app.integrations")
@Getter
@Setter
public class ProviderOAuthProperties {

    private String credentialEncryptionKey = "";
    private boolean cookieSecure;
    private GoogleDrive googleDrive = new GoogleDrive();
    private Github github = new Github();

    public boolean hasValidEncryptionKey() {
        if (credentialEncryptionKey == null || credentialEncryptionKey.isBlank()) {
            return false;
        }
        try {
            return java.util.Base64.getDecoder().decode(credentialEncryptionKey).length == 32;
        } catch (IllegalArgumentException exception) {
            return false;
        }
    }

    public boolean isGoogleDriveConfigured() {
        return hasValidEncryptionKey()
                && googleDrive.hasRequiredCredentials();
    }

    public String googleDriveConfigurationMessage() {
        if (!hasValidEncryptionKey()) {
            return "Set PROVIDER_CREDENTIAL_ENCRYPTION_KEY to a Base64-encoded 32-byte key.";
        }
        if (!googleDrive.hasRequiredCredentials()) {
            return "Set GOOGLE_DRIVE_CLIENT_ID, GOOGLE_DRIVE_CLIENT_SECRET, "
                    + "GOOGLE_DRIVE_REDIRECT_URI, GOOGLE_DRIVE_PICKER_API_KEY, and GOOGLE_DRIVE_APP_ID.";
        }
        return "Google Drive OAuth is configured.";
    }

    public boolean isGithubConfigured() {
        return hasValidEncryptionKey()
                && github.hasRequiredCredentials();
    }

    public String githubConfigurationMessage() {
        if (!hasValidEncryptionKey()) {
            return "Set PROVIDER_CREDENTIAL_ENCRYPTION_KEY to a Base64-encoded 32-byte key.";
        }
        if (!github.hasRequiredCredentials()) {
            return "Set GITHUB_SUBMISSION_CLIENT_ID, GITHUB_SUBMISSION_CLIENT_SECRET, "
                    + "and GITHUB_SUBMISSION_REDIRECT_URI.";
        }
        return "GitHub repository OAuth is configured.";
    }

    @Getter
    @Setter
    public static class GoogleDrive {
        private String clientId = "";
        private String clientSecret = "";
        private String redirectUri = "";
        private String pickerApiKey = "";
        private String appId = "";
        private String authorizationUri = "https://accounts.google.com/o/oauth2/v2/auth";
        private String tokenUri = "https://oauth2.googleapis.com/token";
        private String apiBaseUrl = "https://www.googleapis.com";
        private List<String> scopes = new ArrayList<>(List.of(
                "openid",
                "email",
                "https://www.googleapis.com/auth/drive.file"
        ));

        public boolean hasRequiredCredentials() {
            return hasText(clientId)
                    && hasText(clientSecret)
                    && hasText(redirectUri)
                    && hasText(pickerApiKey)
                    && hasText(appId);
        }

        private boolean hasText(String value) {
            return value != null && !value.isBlank();
        }
    }

    @Getter
    @Setter
    public static class Github {
        private String clientId = "";
        private String clientSecret = "";
        private String redirectUri = "";
        private String authorizationUri = "https://github.com/login/oauth/authorize";
        private String tokenUri = "https://github.com/login/oauth/access_token";
        private String apiBaseUrl = "https://api.github.com";
        private String apiVersion = "2026-03-10";
        private List<String> privateRepositoryScopes = new ArrayList<>(List.of("repo"));

        public boolean hasRequiredCredentials() {
            return hasText(clientId)
                    && hasText(clientSecret)
                    && hasText(redirectUri);
        }

        private boolean hasText(String value) {
            return value != null && !value.isBlank();
        }
    }
}
