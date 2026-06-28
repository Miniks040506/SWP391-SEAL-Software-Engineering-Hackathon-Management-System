package com.t7.seal.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.dto.RepositoryMetadata;
import com.t7.seal.dto.RepositoryRef;
import com.t7.seal.exception.ExternalServiceException;
import com.t7.seal.service.RepositoryMetadataService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
@Slf4j
public class RepositoryMetadataServiceImpl implements RepositoryMetadataService {

    private final ObjectMapper objectMapper;

    @Value("${github.api-base-url:https://api.github.com}")
    private String githubApiBaseUrl;

    @Value("${github.token:}")
    private String githubToken;

    @Value("${gitlab.api-base-url:https://gitlab.com/api/v4}")
    private String gitlabApiBaseUrl;

    @Value("${gitlab.token:}")
    private String gitlabToken;

    @Value("${app.submission.repo-metadata.enabled:true}")
    private boolean metadataEnabled;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .followRedirects(HttpClient.Redirect.NORMAL)
            .build();

    @Override
    public RepositoryMetadata fetchMetadataIfRepository(SubmissionLinkType linkType, String url) {

        if (!metadataEnabled || linkType != SubmissionLinkType.REPOSITORY || isBlank(url)) {
            return null;
        }

        try {
            Optional<RepositoryRef> ref = parseRepositoryRef(url);
            if (ref.isEmpty()) {
                return null;
            }

            return switch (ref.get().platform()) {
                case "GITHUB" -> fetchGithub(ref.get());
                case "GITLAB" -> fetchGitlab(ref.get());
                default -> null;
            };
        } catch (InterruptedException ex) {
            Thread.currentThread().interrupt();
            log.warn(
                    "Repository metadata lookup was interrupted. platform={}",
                    detectPlatform(url),
                    ex
            );
        } catch (IOException | ExternalServiceException | IllegalArgumentException ex) {
            log.warn(
                    "Repository metadata lookup failed. platform={}",
                    detectPlatform(url),
                    ex
            );
        }

        return RepositoryMetadata.builder()
                .platform(detectPlatform(url))
                .repoName(url)
                .build();
    }

    private RepositoryMetadata fetchGithub(RepositoryRef ref) throws IOException, InterruptedException {
        String endpoint = trimRight(githubApiBaseUrl)
                + "/repos/" + ref.ownerOrNamespace() + "/" + ref.repo();
        JsonNode node = requestJson(endpoint, githubToken, false);

        return RepositoryMetadata.builder()
                .platform("GITHUB")
                .repoName(text(node, "full_name",
                        ref.ownerOrNamespace() + "/" + ref.repo()))
                .primaryLanguage(text(node, "language", null))
                .lastPushAt(parseDate(text(node, "pushed_at", null)))
                .isPrivate(node.path("private").isBoolean()
                        ? node.path("private").asBoolean()
                        : null)
                .build();
    }

    private RepositoryMetadata fetchGitlab(RepositoryRef ref) throws IOException, InterruptedException {
        String partUrl = ref.ownerOrNamespace() + "/" + ref.repo();
        String encodedPath = URLEncoder
                .encode(partUrl, StandardCharsets.UTF_8)
                .replace("+", "%20");
        String endpoint = trimRight(gitlabApiBaseUrl) + "/projects/" + encodedPath;
        JsonNode node = requestJson(endpoint, gitlabToken, true);

        return RepositoryMetadata.builder()
                .platform("GITLAB")
                .repoName(text(node, "path_with_namespace", partUrl))
                .primaryLanguage(null)
                .lastPushAt(parseDate(text(
                        node,
                        "last_activity_at",
                        null
                )))
                .isPrivate(node.hasNonNull("visibility")
                        ? !"public".equalsIgnoreCase(node.path("visibility").asText())
                        : null)
                .build();
    }

    private JsonNode requestJson(String endpoint, String token, boolean gitlab) throws IOException, InterruptedException {
        HttpRequest.Builder builder = HttpRequest.newBuilder()
                .uri(URI.create(endpoint))
                .GET()
                .header("Accept", "application/json");

        if (!isBlank(token)) {
            if (gitlab) {
                builder.header("PRIVATE-TOKEN", token);
            } else {
                builder.header("Authorization", "Bearer " + token);
            }
        }

        HttpResponse<String> response = httpClient.send(
                builder.build(),
                HttpResponse.BodyHandlers.ofString()
        );

        if (response.statusCode() < 200 || response.statusCode() >= 300) {
            throw new ExternalServiceException("Repository metadata service returned status " + response.statusCode() + ".");
        }

        return objectMapper.readTree(response.body());
    }

    private Optional<RepositoryRef> parseRepositoryRef(String rawUrl) {
        try {
            URI uri = URI.create(rawUrl.trim());
            String host = uri.getHost() == null ? "" : uri.getHost().toLowerCase(Locale.ROOT);
            String path = uri.getPath() == null ? "" : uri.getPath()
                    .replaceAll("^/+", "")
                    .replaceAll("\\.git$", "");
            String[] parts = path.split("/");

            if (host.contains("github.com") && parts.length >= 2) {
                return Optional.of(new RepositoryRef(
                        "GITHUB",
                        parts[0],
                        parts[1]
                ));
            }

            if (host.contains("gitlab") && parts.length >= 2) {
                String repo = parts[parts.length - 1];
                String namespace = String.join("/",
                        Arrays.copyOf(parts, parts.length - 1));
                return Optional.of(new RepositoryRef(
                        "GITLAB",
                        namespace,
                        repo
                ));
            }

            return Optional.empty();
        } catch (IllegalArgumentException ex) {
            return Optional.empty();
        }
    }

    private String detectPlatform(String url) {
        String lower = url == null ? "" : url.toLowerCase(Locale.ROOT);
        if (lower.contains("github.com")) return "GITHUB";
        if (lower.contains("gitlab")) return "GITLAB";
        return "UNKNOWN";
    }

    private String text(JsonNode node, String field, String fallback) {
        return node != null && node.hasNonNull(field) ? node.path(field).asText() : fallback;
    }

    private LocalDateTime parseDate(String value) {
        if (isBlank(value)) return null;
        try {
            return OffsetDateTime.parse(value).toLocalDateTime();
        } catch (DateTimeParseException ex) {
            return null;
        }
    }

    private String trimRight(String value) {
        return value == null ? "" : value.replaceAll("/+$", "");
    }

    private boolean isBlank(String value) {
        return value == null || value.isBlank();
    }
}
