package com.t7.seal.request.submission;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

@Schema(
        name = "UpdateSubmissionLinkMetadataRequest",
        description = "Editable submission evidence metadata. Storage identity and URL cannot be changed."
)
public record UpdateSubmissionLinkMetadataRequest(
        @Schema(
                description = "Submission evidence type.",
                example = "REPORT",
                allowableValues = {"REPOSITORY", "DEMO", "SLIDE", "REPORT", "VIDEO", "OTHER"}
        )
        String linkType,
        @Schema(description = "Display label. Send an empty value to clear it.", example = "Technical report")
        @Size(max = 200) String label,
        @Schema(description = "Whether this is the primary evidence for its type.", example = "true")
        Boolean isPrimary,
        @Schema(description = "Zero-based display order.", example = "0")
        @PositiveOrZero Integer displayOrder
) {
}
