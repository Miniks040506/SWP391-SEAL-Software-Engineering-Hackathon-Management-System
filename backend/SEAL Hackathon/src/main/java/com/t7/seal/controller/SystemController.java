package com.t7.seal.controller;

import com.t7.seal.config.ApiPaths;
import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import com.t7.seal.service.SystemConfigService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping(ApiPaths.API_V1 + "/system")
@RequiredArgsConstructor
public class SystemController {

    private final SystemConfigService systemConfigService;

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> getSystemConfig(
            @RequestParam(required = false) String category,
            @RequestParam(defaultValue = "false") boolean includeSecrets,
            Authentication authentication
    ) {
        return ResponseEntity.ok(systemConfigService
                .getSystemConfig(category, includeSecrets, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/config/{key}")
    public ResponseEntity<SystemConfigResponse> getSystemConfigByKey(
            @PathVariable String key,
            @RequestParam(defaultValue = "false") boolean includeSecrets,
            Authentication authentication
    ) {
        return ResponseEntity.ok(systemConfigService
                .getSystemConfigByKey(key, includeSecrets, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PutMapping("/config")
    public ResponseEntity<List<SystemConfigResponse>> updateSystemConfig(
            @Valid @RequestBody UpdateSystemConfigRequest request,
            Authentication authentication
    ) {
        return ResponseEntity.ok(systemConfigService
                .updateSystemConfig(request, authentication));
    }

    @PreAuthorize("hasRole('ADMIN')")
    @PostMapping("/config/defaults")
    public ResponseEntity<Void> seedDefaultSystemConfig(Authentication authentication) {
        systemConfigService.seedDefaults(authentication);
        return ResponseEntity.noContent().build();
    }

    @PreAuthorize("hasRole('ADMIN')")
    @GetMapping("/health")
    public ResponseEntity<SystemHealthResponse> getSystemHealth(Authentication authentication) {
        return ResponseEntity.ok(systemConfigService.getSystemHealth(authentication));
    }
}
