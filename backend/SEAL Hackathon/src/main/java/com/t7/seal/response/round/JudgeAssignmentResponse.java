package com.t7.seal.response.round;

import java.util.UUID;

public record JudgeAssignmentResponse(
        UUID id, UUID roundId, UUID judgeId,
        String judgeName, UUID trackId,
        int scoringProgress, Integer totalToScore
) {}
