package com.t7.seal.response.submission;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

public record TeamDetailedScoreResponse(
        UUID eventId,
        String eventName,
        UUID teamId,
        String teamName,
        UUID submissionId,
        UUID roundId,
        String roundName,
        UUID trackId,
        String trackName,
        Double totalScore,
        Integer rankPosition,
        Boolean advanced,
        Integer judgeCount,
        LocalDateTime publishedAt,
        List<TeamScoreCriterionResponse> criteriaScores
) {}

