package com.t7.seal.request.user;

import jakarta.validation.constraints.Size;

public record UpdateUserRequest(
        @Size(max = 200) String fullName,
        @Size(max = 20) String phone,
        String role,
        String status,
        String avatarUrl
) {}
