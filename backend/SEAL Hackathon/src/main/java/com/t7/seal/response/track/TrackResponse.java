package com.t7.seal.response.track;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.domain.SubmissionLinkType;

import java.util.List;
import java.util.UUID;

@Schema(name = "TrackResponse", description = "Response payload for track.")
public record TrackResponse(
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
                description = "Display name of the resource.",
                example = "SEAL Innovators",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String description,
        @Schema(
                description = "Maximum number of teams.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer maxTeams,
        @Schema(
                description = "Collection of required link types.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<SubmissionLinkType> requiredLinkTypes
) {
}