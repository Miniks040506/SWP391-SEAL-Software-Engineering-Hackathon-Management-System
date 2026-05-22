package com.t7.seal.response.user;

import java.util.UUID;

public record ProfileResponse(
        UUID id, String email, String fullName,
        String phone, String avatarUrl,
        String role, String status
) {}
