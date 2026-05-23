package com.t7.seal.response.track;

import java.time.LocalDateTime;
import java.util.UUID;

public record MentorAssignmentResponse(
        UUID id, UUID trackId,
        UUID mentorUserId,
        String mentorName,
        LocalDateTime assignedAt
) {}
