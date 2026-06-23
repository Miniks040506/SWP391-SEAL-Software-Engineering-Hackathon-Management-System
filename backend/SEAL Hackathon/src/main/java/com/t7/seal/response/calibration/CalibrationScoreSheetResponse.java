package com.t7.seal.response.calibration;


import com.t7.seal.response.criteria.EventCriteriaResponse;
import com.t7.seal.response.submission.SubmissionLinkResponse;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record CalibrationScoreSheetResponse(
        UUID calibrationRoundId,
        UUID eventId,
        UUID sampleSubmissionId,
        String sampleTeamName,
        String sampleProjectTitle,
        String sampleNote,
        LocalDateTime startAt,
        LocalDateTime endAt,
        Boolean mandatory,
        Boolean distributionPublished,
        LocalDateTime distributionPublishedAt,
        Boolean canSubmit,
        Boolean submitted,
        LocalDateTime serverTime,
        List<SubmissionLinkResponse> links,
        List<EventCriteriaResponse> criteria,
        List<CalibrationScoreResponse> scores
) {}

