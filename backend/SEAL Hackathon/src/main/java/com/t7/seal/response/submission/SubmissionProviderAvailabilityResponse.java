package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "SubmissionProviderAvailabilityResponse", description = "Availability of a submission input source.")
public record SubmissionProviderAvailabilityResponse(
        @Schema(
                description = "Submission input source.",
                example = "LOCAL_FILE",
                allowableValues = {"URL", "LOCAL_FILE", "GOOGLE_DRIVE", "GITHUB"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String source,
        @Schema(description = "Whether the source is currently configured and usable.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean available,
        @Schema(description = "Actionable setup or availability explanation.", accessMode = Schema.AccessMode.READ_ONLY)
        String message
) {
}
