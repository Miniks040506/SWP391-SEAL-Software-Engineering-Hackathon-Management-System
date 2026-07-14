package com.t7.seal.request.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

//merge both UpdateSubmissionLinkRequest and CreateSubmissionLinkRequest into 1
@Schema(name = "SubmissionLinkRequest", description = "Request payload for submission link.")
public record SubmissionLinkRequest(
        @Schema(
                description = "Client-supplied value for link type.",
                example = "REPOSITORY",
                allowableValues = {"REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"},
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank String linkType,
        @Schema(
                description = "Absolute resource URL.",
                example = "https://example.test/resource",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 1000) String url,
        @Schema(
                description = "Client-supplied value for label.",
                example = "label example"
        )
        String label,
        @Schema(
                description = "Whether primary.",
                example = "true"
        )
        Boolean isPrimary,
        @Schema(
                description = "Client-supplied value for display order.",
                example = "1"
        )
        Integer displayOrder
) {}
