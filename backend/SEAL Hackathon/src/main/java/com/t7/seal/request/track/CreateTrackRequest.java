package com.t7.seal.request.track;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.util.List;

@Schema(name = "CreateTrackRequest", description = "Request payload for create track.")
public record CreateTrackRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 200) String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        @Size(max = 2000) String description,
        @Schema(
                description = "Maximum number of teams.",
                example = "10"
        )
        Integer maxTeams,
        @Schema(
                description = "Collection of required link types."
        )
        List<String> requiredLinkTypes
) {}
