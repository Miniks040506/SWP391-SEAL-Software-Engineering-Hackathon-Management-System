package com.t7.seal.response.round;

import java.util.UUID;

public record JudgeProgressResponse(
        UUID judgeId, String judgeName,
        UUID trackId, int completed,
        int total
) {}
