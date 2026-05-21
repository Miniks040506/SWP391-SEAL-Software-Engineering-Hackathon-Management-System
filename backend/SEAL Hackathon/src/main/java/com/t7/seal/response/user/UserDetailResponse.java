package com.t7.seal.response.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserDetailResponse(
        UUID id,
        String email,
        String fullName,
        String phone,
        String role,
        String status,
        String avatarUrl,
        LocalDateTime emailVerifiedAt,
        LocalDateTime lastLoginAt,
        Object roleProfile
) {}