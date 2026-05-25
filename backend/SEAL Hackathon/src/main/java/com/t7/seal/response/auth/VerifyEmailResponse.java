package com.t7.seal.response.auth;

import java.util.UUID;

public record VerifyEmailResponse(UUID userId, String email, String status, String message) {}