package com.t7.seal.request.track;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotNull;

import java.util.UUID;

@Schema(name = "AssignMentorRequest", description = "Request payload for assign mentor.")
public record AssignMentorRequest(
        @Schema(
                description = "UUID reference to the mentor user.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull UUID mentorUserId
) {}
