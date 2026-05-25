package com.t7.seal.request.auth;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record RegisterRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(min = 8, max = 100) String password,
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 20) String phone,
        @NotBlank String studentType,
        @Size(max = 50) String studentCode,
        @Size(max = 200) String universityName,
        @Size(max = 200) String major,
        Integer graduationYear
) {}
