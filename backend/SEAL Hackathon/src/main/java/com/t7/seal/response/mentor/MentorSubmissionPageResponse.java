package com.t7.seal.response.mentor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(description = "Authoritative mentor submission page and empty-state classification.")
public record MentorSubmissionPageResponse(
        List<MentorSubmissionSummaryResponse> content,
        int page,
        int size,
        long totalElements,
        int totalPages,
        boolean last,
        long assignedTeamCount,
        long submittedTeamCount,
        @Schema(allowableValues = {
                "NONE", "NO_ASSIGNED_TEAMS", "NO_SUBMISSIONS", "NO_FILTER_MATCHES"
        })
        String emptyReason
) {
}
