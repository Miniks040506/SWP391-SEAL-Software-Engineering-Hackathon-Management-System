package com.t7.seal.response.track;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.UUID;

@Schema(name = "TrackTeamProgressResponse", description = "Response payload for track team progress.")
public record TrackTeamProgressResponse(
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
                description = "API-returned value for leader name.",
                example = "leader name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String leaderName,
        @Schema(
                description = "Number of active team members.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        int memberCount,
        @Schema(
                description = "API-returned value for latest submission status.",
                example = "COMPLETE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String latestSubmissionStatus
) {
}