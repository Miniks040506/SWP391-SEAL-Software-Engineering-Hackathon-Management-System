package com.t7.seal.response.coordinator;

import java.time.LocalDateTime;
import java.util.UUID;

public record CoordinatorTeamMemberResponse(
        UUID memberId,
        UUID userId,
        String fullName,
        String email,
        String role,
        String userStatus,
        LocalDateTime joinedAt
) {
}
