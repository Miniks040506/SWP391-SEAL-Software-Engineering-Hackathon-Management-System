package com.t7.seal.response.user;

import java.time.LocalDateTime;
import java.util.UUID;

public record UserApprovalResponse(
        UUID id, String email, String fullName,
        String studentType, String universityName,
        LocalDateTime emailVerifiedAt
) {}
