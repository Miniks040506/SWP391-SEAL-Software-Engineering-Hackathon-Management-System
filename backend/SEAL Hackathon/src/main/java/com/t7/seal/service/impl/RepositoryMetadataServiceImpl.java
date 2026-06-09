package com.t7.seal.service.impl;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.dto.RepositoryMetadata;
import com.t7.seal.dto.RepositoryRef;
import com.t7.seal.service.RepositoryMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.time.LocalDateTime;
import java.time.OffsetDateTime;
import java.util.Arrays;
import java.util.Locale;
import java.util.Optional;

@Service
@RequiredArgsConstructor
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
        } catch (Exception e) {
            return RepositoryMetadata.builder()
                    .platform(detectPlatform(url))
                    .repoName(url)
                    .build();
        }
    }

    private RepositoryMetadata fetchGithub(RepositoryRef ref) {
        return null;
    }

    private RepositoryMetadata fetchGitlab(RepositoryRef ref) {
        return null;
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
        } catch (Exception e) {
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
        } catch (Exception ex) {
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
