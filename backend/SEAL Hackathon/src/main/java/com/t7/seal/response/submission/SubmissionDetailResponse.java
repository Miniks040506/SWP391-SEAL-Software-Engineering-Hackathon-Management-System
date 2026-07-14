package com.t7.seal.response.submission;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;


@Schema(name = "SubmissionDetailResponse", description = "Response payload for submission detail.")
public record SubmissionDetailResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "API-returned value for event name.",
                example = "event name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String eventName,
        @Schema(
                description = "Team UUID.",
                example = "18000000-0000-4000-8000-000000000701",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID teamId,
        @Schema(
                description = "API-returned value for team name.",
                example = "team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String teamName,
        @Schema(
                description = "UUID reference to the leader.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID leaderId,
        @Schema(
                description = "API-returned value for leader name.",
                example = "leader name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String leaderName,
        @Schema(
                description = "Track UUID.",
                example = "18000000-0000-4000-8000-000000000403",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID trackId,
        @Schema(
                description = "API-returned value for track name.",
                example = "track name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String trackName,
        @Schema(
                description = "Competition round UUID.",
                example = "18000000-0000-4000-8000-000000000504",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID roundId,
        @Schema(
                description = "API-returned value for round name.",
                example = "round name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String roundName,
        @Schema(
                description = "Optional business note.",
                example = "Example test note.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String note,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "DRAFT",
                allowableValues = {"DRAFT", "SUBMITTED", "LATE", "DISQUALIFIED"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for submission number.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer submissionNumber,
        @Schema(
                description = "Timestamp for submitted.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime submittedAt,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt,
        @Schema(
                description = "API-returned value for round submission locked.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean roundSubmissionLocked,
        @Schema(
                description = "Timestamp for round submission locked.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime roundSubmissionLockedAt,
        @Schema(
                description = "Collection of links.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<SubmissionLinkResponse> links
) {
}