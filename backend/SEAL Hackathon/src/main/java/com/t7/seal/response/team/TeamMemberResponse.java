package com.t7.seal.response.team;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "TeamMemberResponse", description = "Response payload for team member.")
public record TeamMemberResponse(
        @Schema(
                description = "UUID reference to the member.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID memberId,
        @Schema(
                description = "User UUID.",
                example = "18000000-0000-4000-8000-000000000001",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID userId,
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fullName,
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String email,
        @Schema(
                description = "API-returned value for member role.",
                example = "member role example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String memberRole,
        @Schema(
                description = "Timestamp for joined.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime joinedAt
) {
}