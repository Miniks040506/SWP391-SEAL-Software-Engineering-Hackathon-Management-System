package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.AuditLogResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

@RestController
@RequiredArgsConstructor
@RequestMapping(ApiPaths.API_V1)
public class AuditLogController {

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/audit-logs")
    public ResponseEntity<PageResponse<AuditLogResponse>> getAuditLogs(
            @RequestParam(required = false) UUID actorId,
            @RequestParam(required = false) String actionType,
            @RequestParam(required = false) String targetTable,
            @RequestParam(required = false) UUID targetId,
            @RequestParam(required = false) String from,
            @RequestParam(required = false) String to,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size,
            Authentication authentication
    ) {
        return null;
    }

    @PreAuthorize("hasAnyRole('ADMIN', 'COORDINATOR')")
    @GetMapping("/audit-logs/actions")
    public ResponseEntity<List<String>> getAuditActionTypes(
            Authentication authentication
    ) {
        return null;
    }
}
