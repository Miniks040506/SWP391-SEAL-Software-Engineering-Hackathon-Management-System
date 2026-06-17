package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.PageResponse;
import com.t7.seal.response.system.AuditLogResponse;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/system")
@RequiredArgsConstructor
public class SystemController {

    @GetMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> getSystemConfig(
            @RequestParam(required = false) String category
    ) {
        return null;
    }

    @PutMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> updateSystemConfig(
            @Valid @RequestBody UpdateSystemConfigRequest request
    ) {
        return null;
    }

    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth() {
        return null;
    }

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
    @GetMapping("/audit-logs/action")
    public ResponseEntity<List<String>> getAuditLogs(
            Authentication authentication
    ) {
        return null;
    }
}
