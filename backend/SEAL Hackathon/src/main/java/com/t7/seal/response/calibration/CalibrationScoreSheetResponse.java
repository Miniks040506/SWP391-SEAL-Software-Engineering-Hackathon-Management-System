package com.t7.seal.response.calibration;

import io.swagger.v3.oas.annotations.media.Schema;
import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Schema(name = "CalibrationScoreSheetResponse", description = "Response payload for calibration score sheet.")
public record CalibrationScoreSheetResponse(
        @Schema(
                description = "UUID reference to the calibration round.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID calibrationRoundId,
        @Schema(
                description = "Hackathon event UUID.",
                example = "18000000-0000-4000-8000-000000000303",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID eventId,
        @Schema(
                description = "UUID reference to the sample submission.",
                example = "18000000-0000-4000-8000-000000000999",
                format = "uuid",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        UUID sampleSubmissionId,
        @Schema(
                description = "API-returned value for sample team name.",
                example = "sample team name example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String sampleTeamName,
        @Schema(
                description = "API-returned value for sample project title.",
                example = "sample project title example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String sampleProjectTitle,
        @Schema(
                description = "API-returned value for sample note.",
                example = "sample note example",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        String sampleNote,
        @Schema(
                description = "Start timestamp.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime startAt,
        @Schema(
                description = "End timestamp.",
                example = "2027-08-30T18:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime endAt,
        @Schema(
                description = "API-returned value for mandatory.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean mandatory,
        @Schema(
                description = "API-returned value for distribution published.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean distributionPublished,
        @Schema(
                description = "Timestamp for distribution published.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime distributionPublishedAt,
        @Schema(
                description = "API-returned value for can submit.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean canSubmit,
        @Schema(
                description = "API-returned value for submitted.",
                example = "true",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        Boolean submitted,
        @Schema(
                description = "API-returned value for server time.",
                example = "2027-08-25T08:00:00",
                format = "date-time",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        LocalDateTime serverTime,
        @Schema(
                description = "Collection of links.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<SubmissionLinkResponse> links,
        @Schema(
                description = "Collection of criteria.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<EventCriteriaResponse> criteria,
        @Schema(
                description = "Collection of scores.",
                accessMode = Schema.AccessMode.READ_ONLY
        )
        List<CalibrationScoreResponse> scores
) {
}