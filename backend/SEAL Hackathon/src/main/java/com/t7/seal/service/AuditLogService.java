package com.t7.seal.service;

import com.t7.seal.domain.AuditActionType;
import com.t7.seal.entities.User;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.AuditLogResponse;
import org.springframework.security.core.Authentication;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.UUID;

public interface AuditLogService {
    void record(
            User actor,
            AuditActionType actionType,
            String targetTable,
            UUID targetId,
            Map<String, Object> beforeState,
            Map<String, Object> afterState,
            Map<String, Object> context
    );

    PageResponse<AuditLogResponse> getAuditLogs(
            UUID actorId,
            String actionType,
            String targetTable,
            UUID targetId,
            LocalDateTime from,
            LocalDateTime to,
            int page,
            int size,
            Authentication authentication
    );

    List<String> getActionTypes(Authentication authentication);
}
