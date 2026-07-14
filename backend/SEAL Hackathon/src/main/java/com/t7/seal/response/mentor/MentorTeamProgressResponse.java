package com.t7.seal.response.mentor;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "MentorTeamProgressResponse", description = "Response payload for mentor team progress.")
public record MentorTeamProgressResponse(
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
                description = "API-returned value for project title.",
                example = "project title example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String projectTitle,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "COMPLETE",
                allowableValues = {"FORMING", "COMPLETE", "INCOMPLETE", "REGISTERED", "COMPETING", "ELIMINATED", "ADVANCED", "WINNER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
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
                description = "API-returned value for leader email.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String leaderEmail,
        @Schema(
                description = "Number of active team members.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int memberCount,
        @Schema(
                description = "Number of submission.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long submissionCount,
        @Schema(
                description = "Number of submitted submission.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long submittedSubmissionCount,
        @Schema(
                description = "Number of missing submission.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long missingSubmissionCount,
        @Schema(
                description = "API-returned value for latest submission status.",
                example = "COMPLETE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String latestSubmissionStatus,
        @Schema(
                description = "Timestamp for registered.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime registeredAt,
        @Schema(
                description = "Timestamp when the resource was created.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime createdAt,
        @Schema(
                description = "Timestamp of the latest update.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime updatedAt,
        @Schema(
                description = "Collection of round progress.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<MentorTeamRoundProgressResponse> roundProgress
) {
}