package com.t7.seal.service;

import com.t7.seal.entities.User;
import com.t7.seal.infrastructure.github.GithubSubmissionClient;

import java.net.URI;
import java.time.Instant;
import java.util.List;

public interface GithubConnectionService {

    BeginConnection begin(User user, String returnPath, boolean includePrivateRepositories);

    CompletedConnection complete(String state, String browserNonce, String code);

    ConnectionStatus status(User user);

    List<GithubSubmissionClient.RepositorySummary> repositories(
            User user, int page, int pageSize
    );

    List<GithubSubmissionClient.ReferenceSummary> branches(
            User user, String owner, String repository, int page, int pageSize
    );

    List<GithubSubmissionClient.ReferenceSummary> tags(
            User user, String owner, String repository, int page, int pageSize
    );

    GithubSubmissionClient.RepositorySnapshot snapshot(
            User user, String owner, String repository, String reference
    );

    void disconnect(User user);

    record BeginConnection(
            URI authorizationUri,
            String browserNonce,
            Instant expiresAt
    ) {
    }

    record CompletedConnection(
            String returnPath,
            String accountId,
            String accountEmail,
            boolean privateRepositoriesGranted
    ) {
    }

    record ConnectionStatus(
            boolean available,
            String availabilityMessage,
            boolean connected,
            String accountId,
            String accountEmail,
            boolean privateRepositoriesGranted,
            Instant connectedAt
    ) {
    }
}
