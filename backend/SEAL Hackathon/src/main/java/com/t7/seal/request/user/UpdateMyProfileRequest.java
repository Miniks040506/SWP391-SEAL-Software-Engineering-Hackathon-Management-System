package com.t7.seal.request.user;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record UpdateMyProfileRequest(
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 20) String phone,
        @Size(max = 500) String avatarUrl
) {}
