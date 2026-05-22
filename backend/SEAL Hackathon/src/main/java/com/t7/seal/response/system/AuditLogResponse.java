package com.t7.seal.response.system;

import java.time.LocalDateTime;
import java.util.UUID;

public record AuditLogResponse(
        UUID id, UUID actorId,
        String actorName, String actionType,
        String targetTable, UUID targetId,
        Object beforeState, Object afterState,
        Object context, LocalDateTime createdAt
) {}
