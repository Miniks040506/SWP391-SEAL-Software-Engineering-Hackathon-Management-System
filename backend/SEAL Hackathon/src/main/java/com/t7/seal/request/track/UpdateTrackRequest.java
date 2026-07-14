package com.t7.seal.request.track;

import io.swagger.v3.oas.annotations.media.Schema;

import java.util.List;

@Schema(name = "UpdateTrackRequest", description = "Request payload for update track.")
public record UpdateTrackRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators"
        )
        String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        String description,
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
