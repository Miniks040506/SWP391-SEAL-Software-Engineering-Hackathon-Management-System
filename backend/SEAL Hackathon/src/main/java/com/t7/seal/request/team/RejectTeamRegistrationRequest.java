package com.t7.seal.request.team;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "RejectTeamRegistrationRequest", description = "Request payload for reject team registration.")
public record RejectTeamRegistrationRequest(
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank(message = "Rejection reason is required.")
        @Size(max = 1000, message = "Rejection reason must not exceed 1000 characters.")
        String reason
) {}
