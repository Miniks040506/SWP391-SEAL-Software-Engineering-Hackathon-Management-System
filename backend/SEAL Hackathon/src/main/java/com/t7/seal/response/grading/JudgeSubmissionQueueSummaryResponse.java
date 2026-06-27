package com.t7.seal.response.grading;

public record JudgeSubmissionQueueSummaryResponse(
        long totalAssigned,
        long pending,
        long draftSaved,
        long submitted,
        long locked
) {}
