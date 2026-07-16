package com.t7.seal.infrastructure.github;

import java.net.URI;
import java.time.Instant;
import java.util.List;

/**
 * Authenticated GitHub boundary used for participant repository submissions.
 * Tokens are supplied by the connection service and never returned to clients.
 */
public interface GithubSubmissionClient {

    URI authorizationUri(
            String state,
            String codeChallenge,
            boolean includePrivateRepositories
    );

    TokenGrant exchangeAuthorizationCode(String code, String codeVerifier);

    Account fetchAccount(String accessToken);

    List<RepositorySummary> listRepositories(String accessToken, int page, int pageSize);

    List<ReferenceSummary> listBranches(
            String accessToken,
            String owner,
            String repository,
            int page,
            int pageSize
    );

    List<ReferenceSummary> listTags(
            String accessToken,
            String owner,
            String repository,
            int page,
            int pageSize
    );

    RepositorySnapshot resolveSnapshot(
            String accessToken,
            String owner,
            String repository,
            String reference
    );

    record TokenGrant(
            String accessToken,
            String grantedScopes
    ) {
    }

    record Account(
            String providerAccountId,
            String login,
            String email
    ) {
    }

    record RepositorySummary(
            String owner,
            String name,
            String fullName,
            URI htmlUri,
            String defaultBranch,
            String visibility,
            String primaryLanguage,
            Instant pushedAt,
            boolean privateRepository,
            boolean archived,
            boolean disabled
    ) {
    }

    record ReferenceSummary(
            String name,
            String commitSha,
            boolean protectedBranch
    ) {
    }

    record RepositorySnapshot(
            RepositorySummary repository,
            String selectedReference,
            String commitSha,
            URI commitUri,
            Instant committedAt,
            Instant synchronizedAt
    ) {
    }
}
