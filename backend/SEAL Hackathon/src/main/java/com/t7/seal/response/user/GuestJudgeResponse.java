package com.t7.seal.response.user;

import io.swagger.v3.oas.annotations.media.Schema;

import java.time.LocalDateTime;
import java.util.UUID;

@Schema(name = "GuestJudgeResponse", description = "Response payload for guest judge.")
public record GuestJudgeResponse(
        @Schema(
                description = "User UUID.",
                example = "18000000-0000-4000-8000-000000000001",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID userId,
        @Schema(
                description = "Judge profile UUID.",
                example = "79f650d1-4a5b-552a-8f9b-98570a7a2021",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID judgeId,
        @Schema(
                description = "User email address.",
                example = "student@example.com",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String email,
        @Schema(
                description = "User display name.",
                example = "Nguyen Van An",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String fullName,
        @Schema(
                description = "API-returned value for judge type.",
                example = "GENERAL",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String judgeType,
        @Schema(
                description = "API-returned value for guest.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean guest,
        @Schema(
                description = "API-returned value for temporary.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean temporary,
        @Schema(
                description = "API-returned value for affiliation.",
                example = "affiliation example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String affiliation,
        @Schema(
                description = "API-returned value for expertise.",
                example = "expertise example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String expertise,
        @Schema(
                description = "API-returned value for temporary password link.",
                example = "temporary password link example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String temporaryPasswordLink,
        @Schema(
                description = "Timestamp for expires.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime expiresAt
) {
}