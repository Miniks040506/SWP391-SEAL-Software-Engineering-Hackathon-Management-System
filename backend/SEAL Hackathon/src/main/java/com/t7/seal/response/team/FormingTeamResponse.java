package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "FormingTeamResponse", description = "Response payload for forming team.")
public record FormingTeamResponse(
        @Schema(
                description = "Unique UUID of the resource.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID id,
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String name,
        @Schema(
                description = "API-returned value for project title.",
                example = "project title example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String projectTitle,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
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
                description = "Current lifecycle status of the resource.",
                example = "COMPLETE",
                allowableValues = {"FORMING", "COMPLETE", "INCOMPLETE", "REGISTERED", "COMPETING", "ELIMINATED", "ADVANCED", "WINNER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "Number of active team members.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int memberCount,
        @Schema(
                description = "Maximum team size.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int maxMembers,
        @Schema(
                description = "API-returned value for join code enabled.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean joinCodeEnabled,
        @Schema(
                description = "API-returned value for can request join.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean canRequestJoin,
        @Schema(
                description = "API-returned value for already member.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean alreadyMember,
        @Schema(
                description = "API-returned value for pending join request.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean pendingJoinRequest
) {
}