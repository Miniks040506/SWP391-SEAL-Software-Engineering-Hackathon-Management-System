package com.t7.seal.request.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(name = "SubmitDeliverablesRequest", description = "Request payload for submit deliverables.")
public record SubmitDeliverablesRequest(
        @Schema(
                description = "Optional business note.",
                example = "Example test note."
        )
        @Size(max = 5000, message = "Submission note must be at most 5000 characters")
        String note,
        @Schema(
                description = "Collection of links.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotEmpty(message = "At least one deliverable link is required")
        List<@Valid SubmissionLinkRequest> links
) {}
