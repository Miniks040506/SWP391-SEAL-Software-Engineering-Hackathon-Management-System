package com.t7.seal.service.impl;

import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import com.t7.seal.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {
    @Override
    public List<SystemConfigResponse> getSystemConfig(String category, boolean includeSecrets, Authentication authentication) {
        return List.of();
    }

    @Override
    public SystemConfigResponse getSystemConfigByKey(String key, boolean includeSecrets, Authentication authentication) {
        return null;
    }

    @Override
    public List<SystemConfigResponse> updateSystemConfig(UpdateSystemConfigRequest request, Authentication authentication) {
        return List.of();
    }

    @Override
    public void seedDefaults(Authentication authentication) {

    }

    @Override
    public SystemHealthResponse getSystemHealth(Authentication authentication) {
        return null;
    }

    @Override
    public Optional<String> getRawValue(String key) {
        return Optional.empty();
    }

    @Override
    public String getStringValue(String key, String fallback) {
        return "";
    }

    @Override
    public boolean getBooleanValue(String key, boolean fallback) {
        return false;
    }
}
