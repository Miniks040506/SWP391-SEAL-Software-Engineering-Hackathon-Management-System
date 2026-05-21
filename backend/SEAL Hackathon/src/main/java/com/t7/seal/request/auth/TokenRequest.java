package com.t7.seal.request.auth;

import jakarta.validation.constraints.NotBlank;

public record TokenRequest(@NotBlank String token) {}
