package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExportJobResponse(
        UUID id, UUID requestedBy,
        String exportType, Object params, String status, String fileName,
        Long fileSizeBytes, Integer rowCount, String errorMessage,
        LocalDateTime requestedAt, LocalDateTime completedAt, LocalDateTime expiresAt
) {}
