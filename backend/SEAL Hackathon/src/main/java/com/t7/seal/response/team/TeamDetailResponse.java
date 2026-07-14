package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;
import java.util.UUID;

@Schema(name = "TeamDetailResponse", description = "Response payload for team detail.")
public record TeamDetailResponse(
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
                description = "Current lifecycle status of the resource.",
                example = "COMPLETE",
                allowableValues = {"FORMING", "COMPLETE", "INCOMPLETE", "REGISTERED", "COMPETING", "ELIMINATED", "ADVANCED", "WINNER"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String status,
        @Schema(
                description = "API-returned value for registration status.",
                example = "PENDING_APPROVAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String registrationStatus,
        @Schema(
                description = "Team join code.",
                example = "QACOMPLETE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String joinCode,
        @Schema(
                description = "API-returned value for join code enabled.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean joinCodeEnabled,
        @Schema(
                description = "Collection of members.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<TeamMemberResponse> members
) {
}