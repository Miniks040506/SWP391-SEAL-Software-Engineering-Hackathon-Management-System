package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "CreateTeamRequest", description = "Request payload for create team.")
public record CreateTeamRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 200) String name,
        @Schema(
                description = "Client-supplied value for project title.",
                example = "project title example"
        )
        @Size(max = 200) String projectTitle,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        @Size(max = 1000) String description
) {}
