package com.t7.seal.request.round;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(name = "CreateRoundRequest", description = "Request payload for create round.")
public record CreateRoundRequest(
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
        @Size(max = 10000) String description,
        @Schema(
                description = "Client-supplied value for order index.",
                example = "1",
                requiredMode = Schema.RequiredMode.REQUIRED
        )
        @NotNull Integer orderIndex,
        @Schema(
                description = "Whether this is the final round.",
                example = "true"
        )
        Boolean isFinal,
        @Schema(
                description = "Start timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time"
        )
        LocalDateTime startAt,
        @Schema(
                description = "End timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime endAt,
        @Schema(
                description = "Submission deadline.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime submissionDeadline,
        @Schema(
                description = "Judging deadline.",
                example = "2027-08-30T18:00:00",
                format = "date-time"
        )
        LocalDateTime judgingDeadline
) {}
