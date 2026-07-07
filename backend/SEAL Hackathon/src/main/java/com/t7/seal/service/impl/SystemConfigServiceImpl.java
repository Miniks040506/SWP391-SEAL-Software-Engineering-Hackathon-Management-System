package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.domain.SystemConfigCategory;
import com.t7.seal.domain.ValueType;
import com.t7.seal.entities.SystemConfig;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.repository.SystemConfigRepository;
import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final ObjectMapper objectMapper;

    @Override
    @Transactional(readOnly = true)
    public List<SystemConfigResponse> getSystemConfig(
            String category,
            boolean includeSecrets,
            Authentication authentication
    ) {
        ensureAdmin(authentication);

        List<SystemConfig> configs;
        if (category == null || category.isBlank()) {
            configs = systemConfigRepository.findAllByOrderByCategoryAscConfigKeyAsc();
        } else {
            configs = systemConfigRepository
                    .findByCategoryOrderByConfigKeyAsc(parseCategory(category));
        }

        return configs.stream()
                .map(config -> toResponse(config, includeSecrets))
                .toList();
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

    //HELPERS

    private SystemConfigResponse toResponse(
            SystemConfig config,
            boolean includeSecrets
    ) {
        return new SystemConfigResponse(
                config.getId(),
                config.getConfigKey(),
                displayValue(config, includeSecrets),
                config.getCategory() == null
                        ? null : config.getCategory().name(),
                config.getValueType() == null
                        ? null : config.getValueType().name(),
                Boolean.TRUE.equals(config.getIsEncrypted()),
                Boolean.TRUE.equals(config.getIsActive()),
                config.getDescription(),
                config.getUpdatedAt()
        );
    }

    private Object displayValue(SystemConfig config, boolean includeSecrets) {
        if (Boolean.TRUE.equals(config.getIsEncrypted()) && !includeSecrets) {
            return mask(config.getConfigValue());
        }

        if (config.getValueType() == ValueType.BOOLEAN) {
            return Boolean.parseBoolean(config.getConfigValue());
        }

        if (config.getValueType() == ValueType.INTEGER) {
            try {
                return Integer.parseInt(config.getConfigValue());
            } catch (NumberFormatException ignored) {
                return config.getConfigValue();
            }
        }

        if (config.getValueType() == ValueType.JSON) {
            try {
                return objectMapper.readValue(
                        config.getConfigValue(),
                        Object.class
                );
            } catch (JsonProcessingException ignored) {
                return config.getConfigValue();
            }
        }

        return config.getConfigValue();
    }

    private SystemConfigCategory parseCategory(String category) {
        try {
            return SystemConfigCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unsupported system config category: " + category);
        }
    }

    private String mask(String value) {
        if (value == null || value.isBlank()) return "********";
        if (value.length() <= 4) return "********";
        return "********" + value.substring(value.length() - 4);
    }

    private void ensureAdmin(Authentication authentication) {
        if(!CurrentUser.isAdmin(authentication)) {
            throw new ForbiddenException("Only System admin can manage system configuration");
        }
    }
}
