package com.t7.seal.response.team;

import java.time.LocalDateTime;
import java.util.UUID;

public record TeamMemberResponse(
        UUID userId, String fullName,
        String email, String memberRole,
        LocalDateTime joinedAt
) {}
