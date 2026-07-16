package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(
        name = "SubmissionAttemptResponse",
        description = "Immutable submission state and evidence captured at finalization."
)
public record SubmissionAttemptResponse(
        @Schema(
                description = "Immutable attempt identifier.",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Submission whose finalized state was captured.",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID submissionId,
        @Schema(
                description = "Monotonically increasing attempt number.",
                minimum = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer attemptNumber,
        @Schema(description = "Note captured at finalization.", accessMode = Schema.AccessMode.READ_ONLY)
        String note,
        @Schema(
                description = "Finalized status captured for this attempt.",
                allowableValues = {"SUBMITTED", "LATE", "DISQUALIFIED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Business submission timestamp captured for the attempt.",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submittedAt,
        @Schema(
                description = "Timestamp when the immutable attempt record was created.",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt,
        @Schema(description = "Evidence frozen with this attempt.", accessMode = Schema.AccessMode.READ_ONLY)
        List<SubmissionAttemptEvidenceResponse> evidence
) {
}
