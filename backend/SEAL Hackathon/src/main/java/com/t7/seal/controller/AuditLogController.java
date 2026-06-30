package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.AuditLogResponse;
import com.t7.seal.service.AuditLogService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class AuditLogController {

    private final AuditLogService auditLogService;

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping({
            "/audit-logs",
            "/system/audit-logs",
            "/coordinator/audit-logs",
            "/admin/audit-logs"
    })
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String targetTable,
            @RequestParam(required = false) UUID targetId,
            @RequestParam(required = false) UUID eventId,
            @RequestParam(required = false) UUID teamId,
            @RequestParam(required = false) UUID submissionId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(required = false) String fromDate,
            @RequestParam(required = false) String toDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return ResponseEntity.ok(auditLogService.getAuditLogs(
                actorId,
                actionType,
                targetTable,
                targetId,
                eventId,
                teamId,
                submissionId,
                parseDateTime(firstNonBlank(from, fromDate)),
                parseDateTime(firstNonBlank(to, toDate)),
                page,
                size,
                authentication
        ));
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping({
            "/audit-logs/actions",
            "/system/audit-logs/actions",
            "/coordinator/audit-logs/actions",
            "/admin/audit-logs/actions"
    })
    public ResponseEntity<List<String>> getAuditActionTypes(Authentication authentication) {
        return ResponseEntity.ok(auditLogService.getActionTypes(authentication));
    }

    private LocalDateTime parseDateTime(String value) {
        if (value == null || value.isBlank()) {
            return null;
        }
        return LocalDateTime.parse(value.trim());
    }

    private String firstNonBlank(String first, String second) {
        if (first != null && !first.isBlank()) {
            return first;
        }
        return second;
    }
}
