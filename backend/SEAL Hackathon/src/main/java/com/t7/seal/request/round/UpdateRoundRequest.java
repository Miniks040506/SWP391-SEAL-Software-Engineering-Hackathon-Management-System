package com.t7.seal.request.round;

import io.swagger.v3.oas.annotations.media.Schema;
import jakarta.validation.constraints.Size;

import java.time.LocalDateTime;

@Schema(name = "UpdateRoundRequest", description = "Request payload for update round.")
public record UpdateRoundRequest(
        @Schema(
                description = "Display name of the resource.",
                example = "SEAL Innovators"
        )
        @Size(max = 200) String name,
        @Schema(
                description = "Detailed resource description.",
                example = "Example description for the API contract."
        )
        @Size(max = 10000) String description,
        @Schema(
                description = "Client-supplied value for order index.",
                example = "1"
        )
        Integer orderIndex,
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
        LocalDateTime judgingDeadline,
        @Schema(
                description = "Current lifecycle status of the resource.",
                example = "UPCOMING",
                allowableValues = {"UPCOMING", "OPEN", "PENDING_LOCK", "CLOSED", "JUDGING", "RESULTS_READY"}
        )
        String status
) {}
