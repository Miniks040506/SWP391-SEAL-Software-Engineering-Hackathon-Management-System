package com.t7.seal.request.user;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

@Schema(name = "RejectUserRequest", description = "Request payload for reject user.")
public record RejectUserRequest(
        @Schema(
                description = "Reason supplied for the operation.",
                example = "Valid reason for the operation.",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotBlank @Size(max = 500) String reason
) {}
