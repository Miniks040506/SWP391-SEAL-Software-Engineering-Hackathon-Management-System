package com.t7.seal.response.integration;

import com.t7.seal.infrastructure.github.GithubSubmissionClient;
import io.swagger.v3.oas.annotations.media.Schema;

@Schema(description = "GitHub branch or tag and its current commit.")
public record GithubReferenceResponse(
        String name,
        @Schema(description = "Current immutable commit SHA.") String commitSha,
        @Schema(description = "True only for a protected branch.") boolean protectedBranch
) {
    public static GithubReferenceResponse from(
            GithubSubmissionClient.ReferenceSummary reference
    ) {
        return new GithubReferenceResponse(
                reference.name(), reference.commitSha(), reference.protectedBranch()
        );
    }
}
