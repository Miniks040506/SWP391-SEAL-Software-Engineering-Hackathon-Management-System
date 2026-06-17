package com.t7.seal.response.mentor;

import java.time.LocalDateTime;
import java.util.UUID;

public record MentorTeamMemberResponse(
        UUID memberId,
        UUID userId,
        String fullName,
        String email,
        String role,
        String userStatus,
        LocalDateTime joinedAt
) {
}
