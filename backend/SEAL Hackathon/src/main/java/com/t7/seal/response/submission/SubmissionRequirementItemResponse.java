package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "SubmissionRequirementItemResponse", description = "Effective configuration and completion state for one submission type.")
public record SubmissionRequirementItemResponse(
        @Schema(
                description = "Submission type.",
                example = "REPOSITORY",
                allowableValues = {"REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String type,
        @Schema(description = "User-facing submission type label.", example = "Source repository", accessMode = Schema.AccessMode.READ_ONLY)
        String label,
        @Schema(description = "Whether this type must be satisfied before final submission.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean required,
        @Schema(
                description = "Supported input sources for this type. Availability is reported separately.",
                allowableValues = {"URL", "LOCAL_FILE", "GOOGLE_DRIVE", "GITHUB"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<String> allowedSources,
        @Schema(description = "Whether this type is the default primary deliverable.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean primary,
        @Schema(description = "Stable display order.", example = "1", accessMode = Schema.AccessMode.READ_ONLY)
        int displayOrder,
        @Schema(description = "Whether the current draft already contains this type.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean satisfied,
        @Schema(description = "Current submission-link IDs satisfying this type.", accessMode = Schema.AccessMode.READ_ONLY)
        List<UUID> satisfiedByLinkIds
) {
}
