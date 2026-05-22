package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record SystemConfigResponse(
        UUID id, String configKey,
        Object configValue, String category,
        Boolean encrypted, LocalDateTime updatedAt
) {}