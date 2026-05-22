package com.t7.seal.response.grading;

import java.util.UUID;

public record AssignedSubmissionResponse(
        UUID submissionId, UUID teamId, String teamName, UUID roundId, UUID trackId, String status,
        boolean graded
) {}