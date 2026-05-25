package com.t7.seal.response.grading;

import java.util.List;
import java.util.UUID;

public record ScoreSheetResponse(
        UUID submissionId, UUID judgeId,
        Boolean confirmed, List<ScoreResponse> scores
) {}
