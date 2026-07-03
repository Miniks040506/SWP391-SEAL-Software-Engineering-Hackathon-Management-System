package com.t7.seal.response.round;

import java.time.LocalDateTime;
import java.util.List;
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
        boolean deadlineConfigured,
        boolean criteriaConfigured,
        boolean judgeAssignmentsConfigured,
        long criteriaCount,
        long trackCount,
        List<String> openBlockers,
        long submittedOrLateSubmissionCount,
        long draftSubmissionCount,
        long judgeAssignmentCount

) {
}
