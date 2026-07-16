package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "SubmissionRequirementsResponse", description = "Authoritative submission requirements and current-user permissions for an event, track, and round.")
public record SubmissionRequirementsResponse(
        @Schema(description = "Event UUID.", format = "uuid", accessMode = Schema.AccessMode.READ_ONLY)
        UUID eventId,
        @Schema(description = "Event name.", accessMode = Schema.AccessMode.READ_ONLY)
        String eventName,
        @Schema(description = "Track UUID.", format = "uuid", accessMode = Schema.AccessMode.READ_ONLY)
        UUID trackId,
        @Schema(description = "Track name.", accessMode = Schema.AccessMode.READ_ONLY)
        String trackName,
        @Schema(description = "Team UUID.", format = "uuid", accessMode = Schema.AccessMode.READ_ONLY)
        UUID teamId,
        @Schema(description = "Team name.", accessMode = Schema.AccessMode.READ_ONLY)
        String teamName,
        @Schema(description = "Round UUID.", format = "uuid", accessMode = Schema.AccessMode.READ_ONLY)
        UUID roundId,
        @Schema(description = "Round name.", accessMode = Schema.AccessMode.READ_ONLY)
        String roundName,
        @Schema(description = "Round submission instructions.", accessMode = Schema.AccessMode.READ_ONLY)
        String roundInstructions,
        @Schema(
                description = "Current round status.",
                allowableValues = {"UPCOMING", "OPEN", "PENDING_LOCK", "CLOSED", "JUDGING", "RESULTS_READY"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundStatus,
        @Schema(description = "Submission deadline.", format = "date-time", accessMode = Schema.AccessMode.READ_ONLY)
        LocalDateTime submissionDeadline,
        @Schema(description = "Whether submissions are locked for the round.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean submissionLocked,
        @Schema(description = "Submission lock timestamp, when locked.", format = "date-time", accessMode = Schema.AccessMode.READ_ONLY)
        LocalDateTime submissionLockedAt,
        @Schema(description = "Whether the current user may view these requirements and the current submission.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean canView,
        @Schema(description = "Whether the current user may modify the current submission.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean canEdit,
        @Schema(description = "Whether the current user may finalize a valid submission now.", accessMode = Schema.AccessMode.READ_ONLY)
        boolean canSubmit,
        @Schema(
                description = "Machine-readable primary reason editing and submission are blocked.",
                allowableValues = {"NONE", "NOT_TEAM_LEADER", "TRACK_NOT_ASSIGNED", "TEAM_REGISTRATION_NOT_APPROVED", "TEAM_ELIMINATED", "TEAM_STATUS_NOT_ELIGIBLE", "MISSING_REQUIRED_TYPES", "ROUND_NOT_OPEN", "ROUND_SUBMISSION_LOCKED", "ROUND_SUBMISSION_DEADLINE_EXCEEDED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String blockedReason,
        @Schema(description = "User-facing explanation corresponding to blockedReason.", accessMode = Schema.AccessMode.READ_ONLY)
        String blockedMessage,
        @Schema(description = "All supported submission types in stable display order.", accessMode = Schema.AccessMode.READ_ONLY)
        List<SubmissionRequirementItemResponse> requirements,
        @Schema(description = "Server-authoritative upload policy.", accessMode = Schema.AccessMode.READ_ONLY)
        SubmissionUploadPolicyResponse uploadPolicy,
        @Schema(description = "Availability of every supported input source.", accessMode = Schema.AccessMode.READ_ONLY)
        List<SubmissionProviderAvailabilityResponse> providerAvailability,
        @Schema(description = "Current draft or submitted state for the team and round, or null when none exists.", accessMode = Schema.AccessMode.READ_ONLY)
        SubmissionResponse currentSubmission,
        @Schema(description = "Submission types already present in the current draft/submission.", accessMode = Schema.AccessMode.READ_ONLY)
        List<String> satisfiedTypes,
        @Schema(description = "Required submission types not yet present.", accessMode = Schema.AccessMode.READ_ONLY)
        List<String> missingRequiredTypes
) {
}
