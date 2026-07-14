package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;

@Schema(name = "UpdateTeamRequest", description = "Request payload for update team.")
public record UpdateTeamRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators"
        )
        String name,
        @Schema(
                description = "Client-supplied value for project title.",
                example = "project title example"
        )
        String projectTitle,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description
) {}
