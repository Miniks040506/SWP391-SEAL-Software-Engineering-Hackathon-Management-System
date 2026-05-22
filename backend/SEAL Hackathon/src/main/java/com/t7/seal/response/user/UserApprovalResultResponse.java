package com.t7.seal.response.user;

import java.util.UUID;

public record UserApprovalResultResponse(UUID userId, String status, String message) {}
