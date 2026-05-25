package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record ExportDownloadResponse(
        UUID exportId,
        String fileName, String downloadUrl,
        LocalDateTime expiresAt
) {}
