package com.t7.seal.request.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(name = "UpdateSubmissionRequest", description = "Request payload for update submission.")
public record UpdateSubmissionRequest(
        @Schema(
                description = "Optional business note.",
                example = "Example test note."
        )
        @Size(max = 5000, message = "Submission note must be at most 5000 characters")
        String note,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SUBMITTED", "LATE", "DISQUALIFIED"}
        )
        String status,
        @Schema(
                description = "Collection of links."
        )
        List<@Valid SubmissionLinkRequest> links
) {}