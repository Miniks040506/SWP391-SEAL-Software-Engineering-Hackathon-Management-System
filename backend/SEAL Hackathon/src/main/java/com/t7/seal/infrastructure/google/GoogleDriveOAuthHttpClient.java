package com.t7.seal.infrastructure.google;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.exception.ProviderIntegrationException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.io.InputStream;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.LinkedHashMap;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GoogleDriveOAuthHttpClient implements GoogleDriveOAuthClient {

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);

    private final ProviderOAuthProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Override
    public URI authorizationUri(String state, String codeChallenge) {
        ensureConfigured();
        ProviderOAuthProperties.GoogleDrive google = properties.getGoogleDrive();
        return UriComponentsBuilder.fromUriString(google.getAuthorizationUri())
                .queryParam("client_id", google.getClientId())
                .queryParam("redirect_uri", google.getRedirectUri())
                .queryParam("response_type", "code")
                .queryParam("scope", String.join(" ", google.getScopes()))
                .queryParam("access_type", "offline")
                .queryParam("include_granted_scopes", "true")
                .queryParam("prompt", "consent")
                .queryParam("state", required(state, "OAuth state"))
                .queryParam("code_challenge", required(codeChallenge, "PKCE challenge"))
                .queryParam("code_challenge_method", "S256")
                .build()
                .encode()
                .toUri();
    }

    @Override
    public TokenGrant exchangeAuthorizationCode(String code, String codeVerifier) {
        ProviderOAuthProperties.GoogleDrive google = configuredGoogle();
        Map<String, String> form = baseTokenForm(google);
        form.put("grant_type", "authorization_code");
        form.put("code", required(code, "Authorization code"));
        form.put("redirect_uri", google.getRedirectUri());
        form.put("code_verifier", required(codeVerifier, "PKCE verifier"));
        return requestToken(google, form);
    }

    @Override
    public TokenGrant refreshAccessToken(String refreshToken) {
        ProviderOAuthProperties.GoogleDrive google = configuredGoogle();
        Map<String, String> form = baseTokenForm(google);
        form.put("grant_type", "refresh_token");
        form.put("refresh_token", required(refreshToken, "Refresh token"));
        return requestToken(google, form);
    }

    @Override
    public DriveAccount fetchAccount(String accessToken) {
        ProviderOAuthProperties.GoogleDrive google = configuredGoogle();
        URI uri = URI.create(trimRight(google.getApiBaseUrl())
                + "/drive/v3/about?fields=user(displayName,emailAddress,permissionId)");
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + required(accessToken, "Access token"))
                .GET()
                .build();
        JsonNode user = responseJson(send(request)).path("user");
        String accountId = text(user, "permissionId");
        if (accountId == null) {
            throw ProviderIntegrationException.invalidResponse();
        }
        return new DriveAccount(
                accountId,
                text(user, "emailAddress"),
                text(user, "displayName")
        );
    }

    @Override
    public DriveFile fetchFile(String accessToken, String fileId) {
        ProviderOAuthProperties.GoogleDrive google = configuredGoogle();
        String encodedFileId = encodedFileId(fileId);
        URI uri = URI.create(trimRight(google.getApiBaseUrl())
                + "/drive/v3/files/" + encodedFileId
                + "?supportsAllDrives=true&fields=id,name,mimeType,size,webViewLink,"
                + "modifiedTime,md5Checksum,trashed,capabilities(canDownload)");
        JsonNode file = responseJson(send(authorizedGet(uri, accessToken)));
        if (file.path("trashed").asBoolean(false)) {
            throw ProviderIntegrationException.fileNotFound();
        }

        String returnedId = text(file, "id");
        String name = text(file, "name");
        String mimeType = text(file, "mimeType");
        if (returnedId == null || name == null || mimeType == null) {
            throw ProviderIntegrationException.invalidResponse();
        }
        return new DriveFile(
                returnedId,
                name,
                mimeType,
                longValue(file, "size"),
                uriValue(file, "webViewLink"),
                text(file, "md5Checksum"),
                instantValue(file, "modifiedTime"),
                file.path("capabilities").path("canDownload").asBoolean(false)
        );
    }

    @Override
    public InputStream downloadFile(String accessToken, String fileId) {
        ProviderOAuthProperties.GoogleDrive google = configuredGoogle();
        URI uri = URI.create(trimRight(google.getApiBaseUrl())
                + "/drive/v3/files/" + encodedFileId(fileId)
                + "?alt=media&supportsAllDrives=true");
        try {
            HttpResponse<InputStream> response = httpClient.send(
                    authorizedGet(uri, accessToken),
                    HttpResponse.BodyHandlers.ofInputStream()
            );
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                try (InputStream body = response.body()) {
                    throw providerError(
                            response.statusCode(),
                            new String(body.readAllBytes(), StandardCharsets.UTF_8)
                    );
                }
            }
            return response.body();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw ProviderIntegrationException.unavailable("Google Drive download was interrupted. Try again.");
        } catch (IOException exception) {
            throw ProviderIntegrationException.unavailable("Google Drive file download failed. Try again.");
        }
    }

    private TokenGrant requestToken(
            ProviderOAuthProperties.GoogleDrive google,
            Map<String, String> form
    ) {
        HttpRequest request = HttpRequest.newBuilder(URI.create(google.getTokenUri()))
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "application/json")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .POST(HttpRequest.BodyPublishers.ofString(encodeForm(form)))
                .build();
        JsonNode body = responseJson(send(request));
        String accessToken = text(body, "access_token");
        if (accessToken == null) {
            throw ProviderIntegrationException.invalidResponse();
        }
        long expiresIn = body.path("expires_in").asLong(3600);
        return new TokenGrant(
                accessToken,
                text(body, "refresh_token"),
                text(body, "scope"),
                Instant.now().plusSeconds(Math.max(1, expiresIn))
        );
    }

    private HttpResponse<String> send(HttpRequest request) {
        try {
            HttpResponse<String> response = httpClient.send(
                    request,
                    HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8)
            );
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw providerError(response.statusCode(), response.body());
            }
            return response;
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw ProviderIntegrationException.unavailable("Google Drive request was interrupted. Try again.");
        } catch (IOException exception) {
            throw ProviderIntegrationException.unavailable("Google Drive is currently unreachable. Try again.");
        }
    }

    private ProviderIntegrationException providerError(int status, String body) {
        String providerCode = errorCode(body);
        if (status == 429
                || "rate_limit_exceeded".equalsIgnoreCase(providerCode)
                || "RESOURCE_EXHAUSTED".equalsIgnoreCase(providerCode)
                || body != null && body.toLowerCase().contains("ratelimitexceeded")) {
            return ProviderIntegrationException.rateLimited();
        }
        if ("invalid_grant".equals(providerCode)) {
            return ProviderIntegrationException.revoked();
        }
        if (status == 401) {
            return ProviderIntegrationException.unavailable(
                    "Google Drive rejected the configured OAuth client. Check its client ID and secret."
            );
        }
        if (status == 403) {
            return ProviderIntegrationException.forbidden();
        }
        if (status == 404 || status == 410) {
            return ProviderIntegrationException.fileNotFound();
        }
        return ProviderIntegrationException.unavailable("Google Drive returned an unavailable-provider response.");
    }

    private String errorCode(String body) {
        try {
            JsonNode error = objectMapper.readTree(body).path("error");
            return error.isTextual() ? error.asText() : text(error, "status");
        } catch (JsonProcessingException exception) {
            return null;
        }
    }

    private JsonNode responseJson(HttpResponse<String> response) {
        try {
            return objectMapper.readTree(response.body());
        } catch (JsonProcessingException exception) {
            throw ProviderIntegrationException.invalidResponse();
        }
    }

    private Map<String, String> baseTokenForm(ProviderOAuthProperties.GoogleDrive google) {
        Map<String, String> form = new LinkedHashMap<>();
        form.put("client_id", google.getClientId());
        form.put("client_secret", google.getClientSecret());
        return form;
    }

    private String encodeForm(Map<String, String> form) {
        return form.entrySet().stream()
                .map(entry -> encode(entry.getKey()) + "=" + encode(entry.getValue()))
                .reduce((left, right) -> left + "&" + right)
                .orElse("");
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }

    private HttpRequest authorizedGet(URI uri, String accessToken) {
        return HttpRequest.newBuilder(uri)
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "application/json")
                .header("Authorization", "Bearer " + required(accessToken, "Access token"))
                .GET()
                .build();
    }

    private String encodedFileId(String fileId) {
        String value = required(fileId, "Google Drive file ID").trim();
        if (value.length() > 255 || !value.matches("[A-Za-z0-9_-]+")) {
            throw new IllegalArgumentException("Google Drive file ID is invalid.");
        }
        return UriUtils.encodePathSegment(value, StandardCharsets.UTF_8);
    }

    private Long longValue(JsonNode node, String field) {
        String value = text(node, field);
        if (value == null) {
            return null;
        }
        try {
            return Long.parseLong(value);
        } catch (NumberFormatException exception) {
            throw ProviderIntegrationException.invalidResponse();
        }
    }

    private URI uriValue(JsonNode node, String field) {
        String value = text(node, field);
        try {
            return value == null ? null : URI.create(value);
        } catch (IllegalArgumentException exception) {
            throw ProviderIntegrationException.invalidResponse();
        }
    }

    private Instant instantValue(JsonNode node, String field) {
        String value = text(node, field);
        try {
            return value == null ? null : Instant.parse(value);
        } catch (DateTimeParseException exception) {
            throw ProviderIntegrationException.invalidResponse();
        }
    }

    private ProviderOAuthProperties.GoogleDrive configuredGoogle() {
        ensureConfigured();
        return properties.getGoogleDrive();
    }

    private void ensureConfigured() {
        if (!properties.isGoogleDriveConfigured()) {
            throw ProviderIntegrationException.unavailable(
                    properties.googleDriveConfigurationMessage()
            );
        }
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) {
            throw new IllegalArgumentException(label + " is required.");
        }
        return value;
    }

    private String text(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) && !node.path(field).asText().isBlank()
                ? node.path(field).asText()
                : null;
    }

    private String trimRight(String value) {
        return value.replaceAll("/+$", "");
    }
}
