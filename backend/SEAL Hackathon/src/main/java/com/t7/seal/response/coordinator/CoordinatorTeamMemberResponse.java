package com.t7.seal.response.coordinator;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "CoordinatorTeamMemberResponse", description = "Response payload for coordinator team member.")
public record CoordinatorTeamMemberResponse(
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
                description = "User, member, or message role.",
                example = "STUDENT",
                allowableValues = {"STUDENT", "JUDGE", "MENTOR", "COORDINATOR", "ADMIN"},
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String role,
        @Schema(
                description = "API-returned value for user status.",
                example = "COMPLETE",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String userStatus,
        @Schema(
                description = "Timestamp for joined.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime joinedAt
) {
}