package com.t7.seal.dto;

import com.t7.seal.entities.Submission;
import com.t7.seal.entities.Track;

import java.util.Map;

public record RankingDraft(
        Submission submission,
        Track track,
        Double totalScore,
        Integer judgeCount,
        Map<String, Map<String, Float>> scoreBreakdown
) {}
