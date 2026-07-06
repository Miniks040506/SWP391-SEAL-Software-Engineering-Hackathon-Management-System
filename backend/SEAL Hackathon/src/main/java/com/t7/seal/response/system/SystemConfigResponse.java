package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record SystemConfigResponse(
        UUID id,
        String configKey,
        Object configValue,
        String category,
        String valueType,
        Boolean encrypted,
        Boolean active,
        String description,
        LocalDateTime updatedAt
) {}