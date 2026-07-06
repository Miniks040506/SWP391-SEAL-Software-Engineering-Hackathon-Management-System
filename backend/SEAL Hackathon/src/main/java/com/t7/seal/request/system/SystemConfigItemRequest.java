package com.t7.seal.request.system;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

public record SystemConfigItemRequest(
        @NotBlank String key,
        @NotNull Object value,
        Boolean encrypted,
        String category,
        String valueType,
        String description,
        Boolean active
) {}
