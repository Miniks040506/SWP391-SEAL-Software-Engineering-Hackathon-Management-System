package com.t7.seal.response.results;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

public record RankingResponse(
        UUID id,
        UUID eventId,
        String eventName,
        UUID submissionId,
        UUID teamId,
        String teamName,
        String projectTitle,
        UUID roundId,
        String roundName,
        UUID trackId,
        String trackName,
        Double totalScore,
        Integer rankPosition,
        Boolean advanced,
        Integer judgeCount,
        Map<String, Map<String, Float>> scoreBreakdown,
        LocalDateTime calculatedAt,
        Boolean published,
        String advanceReason,
        String submissionStatus,
        String teamStatus
) {}
