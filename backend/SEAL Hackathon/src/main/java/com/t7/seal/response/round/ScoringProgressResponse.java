package com.t7.seal.response.round;

import java.util.List;
import java.util.UUID;

public record ScoringProgressResponse(
        UUID roundId, int completed,
        int total, double percent,
        List<JudgeProgressResponse> judges
) {}
