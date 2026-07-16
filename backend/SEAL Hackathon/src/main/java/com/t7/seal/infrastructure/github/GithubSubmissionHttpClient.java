package com.t7.seal.infrastructure.github;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.config.ProviderOAuthProperties;
import com.t7.seal.exception.ProviderIntegrationException;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Component;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.web.util.UriUtils;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.Duration;
import java.time.Instant;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

@Component
@RequiredArgsConstructor
public class GithubSubmissionHttpClient implements GithubSubmissionClient {

    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(20);
    private static final String USER_AGENT = "SEAL-Hackathon";

    private final ProviderOAuthProperties properties;
    private final ObjectMapper objectMapper;
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .followRedirects(HttpClient.Redirect.NEVER)
            .build();

    @Override
    public URI authorizationUri(String state, String codeChallenge, boolean includePrivate) {
        ProviderOAuthProperties.Github github = configuredGithub();
        UriComponentsBuilder builder = UriComponentsBuilder.fromUriString(github.getAuthorizationUri())
                .queryParam("client_id", github.getClientId())
                .queryParam("redirect_uri", github.getRedirectUri())
                .queryParam("state", required(state, "OAuth state"))
                .queryParam("code_challenge", required(codeChallenge, "PKCE challenge"))
                .queryParam("code_challenge_method", "S256");
        if (includePrivate && !github.getPrivateRepositoryScopes().isEmpty()) {
            builder.queryParam("scope", String.join(" ", github.getPrivateRepositoryScopes()));
        }
        return builder.build().encode().toUri();
    }

    @Override
    public TokenGrant exchangeAuthorizationCode(String code, String codeVerifier) {
        ProviderOAuthProperties.Github github = configuredGithub();
        Map<String, String> form = new LinkedHashMap<>();
        form.put("client_id", github.getClientId());
        form.put("client_secret", github.getClientSecret());
        form.put("code", required(code, "Authorization code"));
        form.put("redirect_uri", github.getRedirectUri());
        form.put("code_verifier", required(codeVerifier, "PKCE verifier"));
        HttpRequest request = HttpRequest.newBuilder(URI.create(github.getTokenUri()))
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "application/json")
                .header("Content-Type", "application/x-www-form-urlencoded")
                .header("User-Agent", USER_AGENT)
                .POST(HttpRequest.BodyPublishers.ofString(encodeForm(form)))
                .build();
        JsonNode body = requestJson(request, "GITHUB_AUTHORIZATION_INVALID",
                "GitHub authorization could not be completed. Connect again.");
        String accessToken = text(body, "access_token");
        if (accessToken == null) throw invalidResponse();
        return new TokenGrant(accessToken, text(body, "scope"));
    }

    @Override
    public Account fetchAccount(String accessToken) {
        JsonNode body = get(apiUri("user"), accessToken, "GITHUB_ACCOUNT_NOT_FOUND",
                "The connected GitHub account is no longer accessible.");
        String id = text(body, "id");
        String login = text(body, "login");
        if (id == null || login == null) throw invalidResponse();
        return new Account(id, login, text(body, "email"));
    }

    @Override
    public List<RepositorySummary> listRepositories(String token, int page, int pageSize) {
        URI uri = UriComponentsBuilder.fromUri(apiUri("user", "repos"))
                .queryParam("visibility", "all")
                .queryParam("affiliation", "owner,collaborator,organization_member")
                .queryParam("sort", "pushed")
                .queryParam("direction", "desc")
                .queryParam("page", validPage(page))
                .queryParam("per_page", validPageSize(pageSize))
                .build().encode().toUri();
        JsonNode body = get(uri, token, "GITHUB_REPOSITORIES_NOT_ACCESSIBLE",
                "No accessible GitHub repositories were found.");
        if (!body.isArray()) throw invalidResponse();
        List<RepositorySummary> repositories = new ArrayList<>();
        body.forEach(node -> repositories.add(repository(node)));
        return repositories;
    }

    @Override
    public List<ReferenceSummary> listBranches(
            String token, String owner, String repository, int page, int pageSize
    ) {
        return references(token, owner, repository, "branches", page, pageSize, true);
    }

    @Override
    public List<ReferenceSummary> listTags(
            String token, String owner, String repository, int page, int pageSize
    ) {
        return references(token, owner, repository, "tags", page, pageSize, false);
    }

    @Override
    public RepositorySnapshot resolveSnapshot(
            String token, String owner, String repository, String reference
    ) {
        String safeOwner = segment(owner, "Repository owner");
        String safeRepository = segment(repository, "Repository name");
        JsonNode repositoryBody = get(apiUri("repos", owner, repository), token,
                "GITHUB_REPOSITORY_NOT_FOUND", "The selected GitHub repository is not accessible.");
        RepositorySummary summary = repository(repositoryBody);
        String selectedReference = required(reference, "Repository reference").trim();
        URI commitApiUri = URI.create(configuredGithub().getApiBaseUrl().replaceAll("/+$", "")
                + "/repos/" + safeOwner + "/" + safeRepository + "/commits/"
                + referenceSegment(selectedReference));
        JsonNode commit = get(commitApiUri, token,
                "GITHUB_REFERENCE_NOT_FOUND", "The selected branch, tag, or commit no longer exists.");
        String sha = text(commit, "sha");
        URI commitUri = uri(commit, "html_url");
        if (sha == null || commitUri == null) throw invalidResponse();
        return new RepositorySnapshot(summary, selectedReference, sha, commitUri,
                instant(commit.path("commit").path("committer"), "date"), Instant.now());
    }

    private List<ReferenceSummary> references(
            String token, String owner, String repository, String type,
            int page, int pageSize, boolean branches
    ) {
        URI uri = UriComponentsBuilder.fromUri(apiUri(
                        "repos", owner, repository, type))
                .queryParam("page", validPage(page))
                .queryParam("per_page", validPageSize(pageSize))
                .build().encode().toUri();
        JsonNode body = get(uri, token, "GITHUB_REPOSITORY_NOT_FOUND",
                "The selected GitHub repository is not accessible.");
        if (!body.isArray()) throw invalidResponse();
        List<ReferenceSummary> references = new ArrayList<>();
        body.forEach(node -> {
            String name = text(node, "name");
            String sha = text(node.path("commit"), "sha");
            if (name == null || sha == null) throw invalidResponse();
            references.add(new ReferenceSummary(
                    name, sha, branches && node.path("protected").asBoolean(false)));
        });
        return references;
    }

    private RepositorySummary repository(JsonNode node) {
        String owner = text(node.path("owner"), "login");
        String name = text(node, "name");
        String fullName = text(node, "full_name");
        URI htmlUri = uri(node, "html_url");
        if (owner == null || name == null || fullName == null || htmlUri == null) {
            throw invalidResponse();
        }
        boolean privateRepository = node.path("private").asBoolean(false);
        String visibility = text(node, "visibility");
        return new RepositorySummary(owner, name, fullName, htmlUri,
                text(node, "default_branch"),
                visibility == null ? (privateRepository ? "private" : "public") : visibility,
                text(node, "language"), instant(node, "pushed_at"), privateRepository,
                node.path("archived").asBoolean(false), node.path("disabled").asBoolean(false));
    }

    private JsonNode get(URI uri, String token, String notFoundCode, String notFoundMessage) {
        ProviderOAuthProperties.Github github = configuredGithub();
        HttpRequest request = HttpRequest.newBuilder(uri)
                .timeout(REQUEST_TIMEOUT)
                .header("Accept", "application/vnd.github+json")
                .header("Authorization", "Bearer " + required(token, "Access token"))
                .header("X-GitHub-Api-Version", github.getApiVersion())
                .header("User-Agent", USER_AGENT)
                .GET().build();
        return requestJson(request, notFoundCode, notFoundMessage);
    }

    private JsonNode requestJson(HttpRequest request, String notFoundCode, String notFoundMessage) {
        try {
            HttpResponse<String> response = httpClient.send(
                    request, HttpResponse.BodyHandlers.ofString(StandardCharsets.UTF_8));
            if (response.statusCode() < 200 || response.statusCode() >= 300) {
                throw providerError(response, notFoundCode, notFoundMessage);
            }
            return objectMapper.readTree(response.body());
        } catch (JsonProcessingException exception) {
            throw invalidResponse();
        } catch (InterruptedException exception) {
            Thread.currentThread().interrupt();
            throw unavailable("GitHub request was interrupted. Try again.");
        } catch (IOException exception) {
            throw unavailable("GitHub is currently unreachable. Try again.");
        }
    }

    private ProviderIntegrationException providerError(
            HttpResponse<String> response, String notFoundCode, String notFoundMessage
    ) {
        int status = response.statusCode();
        String body = response.body() == null ? "" : response.body().toLowerCase();
        boolean rateLimited = status == 429
                || response.headers().firstValue("x-ratelimit-remaining").orElse("1").equals("0")
                || body.contains("rate limit");
        if (rateLimited) return error(HttpStatus.TOO_MANY_REQUESTS, "GITHUB_RATE_LIMITED",
                "GitHub rate limit reached. Wait and try again.");
        if (status == 401) return error(HttpStatus.UNAUTHORIZED, "GITHUB_AUTHORIZATION_INVALID",
                "GitHub authorization expired or was revoked. Connect again.");
        if (status == 403) return error(HttpStatus.FORBIDDEN, "GITHUB_PERMISSION_DENIED",
                "GitHub denied access. Grant the required repository access and retry.");
        if (status == 404) return error(HttpStatus.NOT_FOUND, notFoundCode, notFoundMessage);
        if (status == 400 && response.request().uri().getPath().contains("/login/oauth/access_token")) {
            return error(HttpStatus.UNAUTHORIZED, "GITHUB_AUTHORIZATION_INVALID",
                    "GitHub authorization could not be completed. Connect again.");
        }
        if (status == 400 || status == 422) return error(HttpStatus.BAD_REQUEST,
                "GITHUB_REFERENCE_INVALID", "GitHub rejected the selected repository reference.");
        return unavailable("GitHub returned an unavailable-provider response.");
    }

    private URI apiUri(String... segments) {
        StringBuilder path = new StringBuilder(configuredGithub().getApiBaseUrl().replaceAll("/+$", ""));
        for (String segment : segments) path.append('/').append(segment(segment, "GitHub path"));
        return URI.create(path.toString());
    }

    private String segment(String value, String label) {
        String normalized = required(value, label).trim();
        if (normalized.length() > 255 || normalized.contains("/") || normalized.contains("\\")) {
            throw error(HttpStatus.BAD_REQUEST, "GITHUB_RESOURCE_INVALID", label + " is invalid.");
        }
        return UriUtils.encodePathSegment(normalized, StandardCharsets.UTF_8);
    }

    private String referenceSegment(String value) {
        String normalized = required(value, "Repository reference").trim();
        if (normalized.length() > 255 || normalized.contains("\\")) {
            throw error(HttpStatus.BAD_REQUEST, "GITHUB_REFERENCE_INVALID",
                    "Repository reference is invalid.");
        }
        return UriUtils.encodePathSegment(normalized, StandardCharsets.UTF_8);
    }

    private String encodeForm(Map<String, String> form) {
        return form.entrySet().stream()
                .map(entry -> URLEncoder.encode(entry.getKey(), StandardCharsets.UTF_8) + "="
                        + URLEncoder.encode(entry.getValue(), StandardCharsets.UTF_8))
                .reduce((left, right) -> left + "&" + right).orElse("");
    }

    private String required(String value, String label) {
        if (value == null || value.isBlank()) throw new IllegalArgumentException(label + " is required.");
        return value;
    }

    private String text(JsonNode node, String field) {
        return node != null && node.hasNonNull(field) && !node.path(field).asText().isBlank()
                ? node.path(field).asText() : null;
    }

    private URI uri(JsonNode node, String field) {
        String value = text(node, field);
        try {
            return value == null ? null : URI.create(value);
        } catch (IllegalArgumentException exception) {
            throw invalidResponse();
        }
    }

    private Instant instant(JsonNode node, String field) {
        String value = text(node, field);
        try {
            return value == null ? null : Instant.parse(value);
        } catch (DateTimeParseException exception) {
            throw invalidResponse();
        }
    }

    private int validPage(int page) {
        return Math.max(1, page);
    }

    private int validPageSize(int pageSize) {
        return Math.max(1, Math.min(100, pageSize));
    }

    private ProviderOAuthProperties.Github configuredGithub() {
        if (!properties.isGithubConfigured()) {
            throw unavailable(properties.githubConfigurationMessage());
        }
        return properties.getGithub();
    }

    private ProviderIntegrationException invalidResponse() {
        return error(HttpStatus.BAD_GATEWAY, "GITHUB_INVALID_RESPONSE",
                "GitHub returned an incomplete response. Try again.");
    }

    private ProviderIntegrationException unavailable(String message) {
        return error(HttpStatus.SERVICE_UNAVAILABLE, "GITHUB_UNAVAILABLE", message);
    }

    private ProviderIntegrationException error(HttpStatus status, String code, String message) {
        return new ProviderIntegrationException(status, code, message);
    }
}
