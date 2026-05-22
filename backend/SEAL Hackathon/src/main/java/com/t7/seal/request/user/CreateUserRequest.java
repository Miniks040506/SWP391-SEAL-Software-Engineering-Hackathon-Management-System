package com.t7.seal.request.user;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public record CreateUserRequest(
        @NotBlank @Email String email,
        @NotBlank @Size(max = 200) String fullName,
        @Size(max = 20) String phone,
        @NotBlank String role,
        @NotBlank String status
) {}