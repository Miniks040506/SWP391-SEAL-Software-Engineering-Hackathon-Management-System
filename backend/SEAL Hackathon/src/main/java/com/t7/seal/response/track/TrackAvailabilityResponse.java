package com.t7.seal.response.track;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.domain.SubmissionLinkType;

import java.util.List;
import java.util.UUID;

@Schema(name = "TrackAvailabilityResponse", description = "Response payload for track availability.")
public record TrackAvailabilityResponse(
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
                description = "Minimum team size.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer minMembers,
        @Schema(
                description = "Maximum team size.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer maxMembers,
        @Schema(
                description = "Maximum number of teams.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Integer maxTeams,
        @Schema(
                description = "Number of registered team.",
                example = "1",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        long registeredTeamCount,
        @Schema(
                description = "API-returned value for remaining slots.",
                example = "10",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Long remainingSlots,
        @Schema(
                description = "API-returned value for full.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        boolean full,
        @Schema(
                description = "Collection of required link types.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<SubmissionLinkType> requiredLinkTypes
) {
}