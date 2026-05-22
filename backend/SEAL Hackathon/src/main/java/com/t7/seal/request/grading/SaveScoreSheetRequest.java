package com.t7.seal.request.grading;

import jakarta.validation.constraints.NotEmpty;

import java.util.List;

public record SaveScoreSheetRequest(
        @NotEmpty List<ScoreItemRequest> scores,
        String generalComment, Boolean draft)
{}