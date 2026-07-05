package com.t7.seal.service;

import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import org.springframework.security.core.Authentication;

import java.util.List;
import java.util.Optional;

public interface SystemConfigService {
    
    List<SystemConfigResponse> getSystemConfig(String category,
                                               boolean includeSecrets,
                                               Authentication authentication);

    SystemConfigResponse getSystemConfigByKey(String key,
                                              boolean includeSecrets,
                                              Authentication authentication);

    List<SystemConfigResponse> updateSystemConfig(UpdateSystemConfigRequest request,
                                                  Authentication authentication);

    void seedDefaults(Authentication authentication);

    SystemHealthResponse getSystemHealth(Authentication authentication);

    Optional<String> getRawValue(String key);

    String getStringValue(String key, String fallback);

    boolean getBooleanValue(String key, boolean fallback);
}
