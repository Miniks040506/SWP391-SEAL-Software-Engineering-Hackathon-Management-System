package com.t7.seal.response.submission;

import java.time.LocalDateTime;

public record FileDownloadUrlResponse(
        String url,
        LocalDateTime expiresAt
) {
}

