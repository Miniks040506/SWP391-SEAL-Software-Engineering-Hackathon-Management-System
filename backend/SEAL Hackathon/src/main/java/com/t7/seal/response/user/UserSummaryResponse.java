package com.t7.seal.response.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserSummaryResponse(
        UUID id, String email, String fullName,
        String role, String status,
        LocalDateTime createdAt
) {}
