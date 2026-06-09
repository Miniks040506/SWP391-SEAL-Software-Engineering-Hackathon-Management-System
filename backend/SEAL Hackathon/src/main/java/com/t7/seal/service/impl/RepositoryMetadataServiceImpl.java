package com.t7.seal.service.impl;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.SubmissionLinkType;
import com.t7.seal.infrastructure.RepositoryMetadata;
import com.t7.seal.service.RepositoryMetadataService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.http.HttpClient;

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
        return null;
    }
}
