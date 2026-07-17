package com.t7.seal.response.mentor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(description = "Submitted evidence visible through a mentor's track assignment.")
public record MentorSubmissionSummaryResponse(
        UUID id,
        UUID eventId,
        String eventName,
        UUID trackId,
        String trackName,
        UUID teamId,
        String teamName,
        UUID roundId,
        String roundName,
        @Schema(allowableValues = {"SUBMITTED", "LATE", "DISQUALIFIED"}) String status,
        Integer submissionNumber,
        @Schema(format = "date-time") LocalDateTime submittedAt,
        @Schema(format = "date-time") LocalDateTime updatedAt,
        long linkCount,
        boolean late
) {
}
