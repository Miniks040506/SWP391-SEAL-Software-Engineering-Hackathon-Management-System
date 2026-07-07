package com.t7.seal.service.impl;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.domain.AuditActionType;
import com.t7.seal.domain.SystemConfigCategory;
import com.t7.seal.domain.ValueType;
import com.t7.seal.entities.SystemConfig;
import com.t7.seal.entities.User;
import com.t7.seal.exception.BadRequestException;
import com.t7.seal.exception.ForbiddenException;
import com.t7.seal.exception.NotFoundException;
import com.t7.seal.repository.SystemConfigRepository;
import com.t7.seal.request.system.SystemConfigItemRequest;
import com.t7.seal.request.system.UpdateSystemConfigRequest;
import com.t7.seal.response.system.SystemConfigResponse;
import com.t7.seal.response.system.SystemHealthResponse;
import com.t7.seal.security.guard.CurrentUser;
import com.t7.seal.service.AuditLogService;
import com.t7.seal.service.CurrentUserService;
import com.t7.seal.service.SystemConfigService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class SystemConfigServiceImpl implements SystemConfigService {

    private final SystemConfigRepository systemConfigRepository;
    private final CurrentUserService currentUserService;
    private final AuditLogService auditLogService;
    private final ObjectMapper objectMapper;
    private final AiProviderProperties aiProviderProperties;

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
    @Transactional(readOnly = true)
    public SystemConfigResponse getSystemConfigByKey(
            String key,
            boolean includeSecrets,
            Authentication authentication
    ) {
        ensureAdmin(authentication);

        SystemConfig config = systemConfigRepository.findByConfigKey(normalizeKey(key))
                .orElseThrow(() ->
                        new NotFoundException("System config not found: " + key));

        return toResponse(config, includeSecrets);
    }

    @Override
    @Transactional
    public List<SystemConfigResponse> updateSystemConfig(
            UpdateSystemConfigRequest request,
            Authentication authentication
    ) {
        User actor = currentUserService.getCurrentUser(authentication);
        ensureAdmin(authentication);

        if (request == null || request.items() == null || request.items().isEmpty()) {
            throw new BadRequestException("At least one config item is required.");
        }

        LocalDateTime now = LocalDateTime.now();
        List<SystemConfig> saved = request.items().stream()
                .map(item ->
                        upsertItem(item, actor, now))
                .toList();

        return saved.stream()
                .map(config ->
                        toResponse(config, false))
                .toList();
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

    private SystemConfig upsertItem(
            SystemConfigItemRequest item,
            User actor,
            LocalDateTime now
    ) {
        String key = normalizeKey(item.key());
        ValueType valueType = parseValueType(item.valueType(), item.value());

        SystemConfigCategory category = item.category() == null || item.category().isBlank()
                ? inferCategory(key)
                : parseCategory(item.category());

        String serialized = serializeValue(item.value(), valueType);
        boolean encrypted = Boolean.TRUE.equals(item.encrypted()) || looksSecret(key);

        SystemConfig config = systemConfigRepository.findByConfigKey(key)
                .orElseGet(() -> SystemConfig.builder()
                        .configKey(key)
                        .createdAt(now)
                        .updatedBy(actor)
                        .build()
                );

        Map<String, Object> before = config.getId() == null
                ? null : auditState(config, false);

        config.setConfigValue(serialized);
        config.setValueType(valueType);
        config.setCategory(category);
        config.setDescription(item.description() == null
                ? config.getDescription() : item.description().trim());
        config.setIsEncrypted(encrypted);
        config.setIsActive(item.active() == null
                ? Boolean.TRUE : item.active());
        config.setUpdatedAt(now);
        config.setUpdatedBy(actor);

        SystemConfig saved = systemConfigRepository.save(config);
        auditLogService.record(
                actor,
                AuditActionType.SYSTEM_CONFIG_CHANGED,
                "system_configs",
                saved.getId(),
                before,
                auditState(saved, false),
                Map.of("configKey", saved.getConfigKey())
        );
        return saved;
    }

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

    private Map<String, Object> auditState(
            SystemConfig config,
            boolean includeSecrets
    ) {
        Map<String, Object> state = new LinkedHashMap<>();

        state.put("configKey", config.getConfigKey());
        state.put("configValue", displayValue(config, includeSecrets));
        state.put("category", config.getCategory() == null
                ? null : config.getCategory().name());
        state.put("valueType", config.getValueType() == null
                ? null : config.getValueType().name());
        state.put("encrypted", config.getIsEncrypted());
        state.put("active", config.getIsActive());

        return state;
    }

    private String serializeValue(Object value, ValueType valueType) {
        if (value == null) {
            throw new BadRequestException("Config value is required.");
        }

        try {
            return switch (valueType) {
                case BOOLEAN -> String.valueOf(Boolean
                        .parseBoolean(String.valueOf(value)));
                case INTEGER -> String.valueOf(Integer
                        .parseInt(String.valueOf(value)));
                case JSON -> value instanceof String s
                        ? s : objectMapper.writeValueAsString(value);
                case STRING -> String.valueOf(value);
            };
        } catch (NumberFormatException ex) {
            throw new BadRequestException("Invalid integer config value: " + value);
        } catch (JsonProcessingException ex) {
            throw new BadRequestException("Invalid JSON config value.");
        }
    }

    private ValueType parseValueType(String valueType, Object value) {
        if (valueType != null && !valueType.isBlank()) {
            try {
                return ValueType.valueOf(valueType.trim().toUpperCase());
            } catch (IllegalArgumentException ex) {
                throw new BadRequestException("Unsupported valueType: " + valueType);
            }
        }

        if (value instanceof Boolean) return ValueType.BOOLEAN;
        if (value instanceof Number) return ValueType.INTEGER;
        if (value instanceof Map<?, ?> || value instanceof List<?>) return ValueType.JSON;

        return ValueType.STRING;
    }

    private SystemConfigCategory parseCategory(String category) {
        try {
            return SystemConfigCategory.valueOf(category.trim().toUpperCase());
        } catch (IllegalArgumentException e) {
            throw new BadRequestException("Unsupported system config category: " + category);
        }
    }

    private SystemConfigCategory inferCategory(String key) {
        if (key.startsWith("smtp.") || key.startsWith("email."))
            return SystemConfigCategory.SMTP;

        if (key.startsWith("github.") || key.startsWith("gitlab.")
                || key.startsWith("oauth.") || key.startsWith("storage."))
            return SystemConfigCategory.INTEGRATION;

        if (key.startsWith("security.")) return SystemConfigCategory.SECURITY;
        if (key.startsWith("rate_limit.")) return SystemConfigCategory.RATE_LIMIT;
        if (key.startsWith("feature.")) return SystemConfigCategory.FEATURE_FLAG;

        return SystemConfigCategory.GENERAL;
    }

    private String normalizeKey(String key) {
        if (key == null || key.isBlank()) {
            throw new BadRequestException("Config key is required.");
        }
        return key.trim().toLowerCase();
    }

    private boolean looksSecret(String key) {
        String normalized = key.toLowerCase();
        return normalized.contains("secret")
                || normalized.contains("token")
                || normalized.contains("password")
                || normalized.contains("api_key")
                || normalized.contains("apikey");
    }

    private String mask(String value) {
        if (value == null || value.isBlank()) return "********";
        if (value.length() <= 4) return "********";
        return "********" + value.substring(value.length() - 4);
    }

    private void ensureAdmin(Authentication authentication) {
        if (!CurrentUser.isAdmin(authentication)) {
            throw new ForbiddenException("Only System admin can manage system configuration");
        }
    }
}
