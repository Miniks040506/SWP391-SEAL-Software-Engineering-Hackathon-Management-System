package com.t7.seal.response.round;

import java.time.LocalDateTime;
import java.util.UUID;

public record RoundOperationStatusResponse(
        UUID roundId,
        UUID eventId,
        String eventStatus,
        String roundStatus,
        LocalDateTime startAt,
        LocalDateTime endAt,
        LocalDateTime submissionDeadline,
        LocalDateTime judgingDeadline,
        LocalDateTime submissionLockedAt,
        LocalDateTime gradingLockedAt,
        boolean canOpen,
        boolean canClose,
        boolean canLockSubmissions,
        long submittedOrLateSubmissionCount,
        long draftSubmissionCount,
        long judgeAssignmentCount

) {
}
