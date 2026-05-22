package com.t7.seal.response.results;

import java.time.LocalDateTime;
import java.util.UUID;

public record PublishResultsResponse(
        UUID eventId, LocalDateTime publishedAt,
        UUID announcementId, int notifiedCount
) {}
