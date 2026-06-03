package com.t7.seal.response.user;

import com.t7.seal.domain.UserRole;
import com.t7.seal.domain.UserStatus;

import java.util.UUID;

public record AssignableUserResponse(
        UUID userId,
        UUID judgeId,
        String email,
        String fullName,
        UserRole role,
        UserStatus status
) {
}
