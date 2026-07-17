package com.t7.seal.request.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Schema(description = "Selects or synchronizes an authenticated GitHub repository snapshot.")
public record SelectGithubRepositoryRequest(
        @Schema(example = "seal-team")
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9](?:[A-Za-z0-9-]{0,38})$",
                message = "GitHub owner is invalid.")
        String owner,
        @Schema(example = "hackathon-project")
        @NotBlank
        @Pattern(regexp = "^[A-Za-z0-9._-]{1,100}$",
                message = "GitHub repository name is invalid.")
        String repository,
        @Schema(description = "Branch, tag, or commit to resolve.", example = "main")
        @NotBlank @Size(max = 255)
        String reference,
        @Schema(example = "BRANCH", allowableValues = {"BRANCH", "TAG", "COMMIT"})
        @NotBlank
        @Pattern(regexp = "^(BRANCH|TAG|COMMIT)$",
                message = "Reference type must be BRANCH, TAG, or COMMIT.")
        String referenceType,
        @Schema(example = "Final repository")
        @Size(max = 200)
        String label,
        Boolean isPrimary,
        @PositiveOrZero Integer displayOrder
) {
}
