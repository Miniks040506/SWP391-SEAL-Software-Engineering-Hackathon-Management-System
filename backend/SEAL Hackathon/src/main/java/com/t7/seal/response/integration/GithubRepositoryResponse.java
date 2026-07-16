package com.t7.seal.response.integration;

import com.t7.seal.infrastructure.github.GithubSubmissionClient;
import io.swagger.v3.oas.annotations.media.Schema;

import java.time.Instant;

@Schema(description = "Repository accessible to the connected GitHub user.")
public record GithubRepositoryResponse(
        String owner,
        String name,
        String fullName,
        @Schema(format = "uri") String htmlUrl,
        String defaultBranch,
        @Schema(allowableValues = {"public", "private", "internal"}) String visibility,
        String primaryLanguage,
        @Schema(format = "date-time") Instant pushedAt,
        boolean privateRepository,
        boolean archived,
        boolean disabled
) {
    public static GithubRepositoryResponse from(
            GithubSubmissionClient.RepositorySummary repository
    ) {
        return new GithubRepositoryResponse(
                repository.owner(), repository.name(), repository.fullName(),
                repository.htmlUri().toString(), repository.defaultBranch(),
                repository.visibility(), repository.primaryLanguage(), repository.pushedAt(),
                repository.privateRepository(), repository.archived(), repository.disabled()
        );
    }
}
