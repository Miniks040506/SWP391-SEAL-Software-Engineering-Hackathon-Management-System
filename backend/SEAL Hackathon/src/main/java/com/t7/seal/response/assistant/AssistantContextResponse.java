package com.t7.seal.response.assistant;

import java.util.List;
import java.util.Map;
import java.util.UUID;

public record AssistantContextResponse(
        UUID userId,
        String fullName,
        String role,
        String status,
        List<String> quickPrompts,
        Map<String, Object> roleContext
) {}
