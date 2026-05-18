package com.t7.seal.entities;

import com.t7.seal.domain.SystemConfigCategory;
import com.t7.seal.domain.ValueType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "system_configs",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_sysconfig_key", columnNames = "config_key")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "config_key", nullable = false, length = 200)
    private String configKey;

    @Column(name = "config_value", columnDefinition = "TEXT")
    private String configValue;

    @Enumerated(EnumType.STRING)
    @Column(name = "value_type", nullable = false, length = 30)
    @Builder.Default
    private ValueType valueType = ValueType.STRING;

    @Column(name = "is_encrypted", nullable = false)
    @Builder.Default
    private Boolean isEncrypted = false;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    @Builder.Default
    private SystemConfigCategory category = SystemConfigCategory.GENERAL;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "updated_by", nullable = false)
    private User updatedBy;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    // Checks whether this configuration is active and usable.
    public boolean isUsable() {
        return Boolean.TRUE.equals(isActive);
    }

    // Checks whether this configuration stores a boolean value.
    public boolean isBoolean() {
        return valueType == ValueType.BOOLEAN;
    }

    // Checks whether this configuration stores an integer value.
    public boolean isInteger() {
        return valueType == ValueType.INTEGER;
    }

    // Checks whether this configuration stores a JSON value.
    public boolean isJson() {
        return valueType == ValueType.JSON;
    }

    // Deactivates this configuration.
    public void deactivate() {
        isActive = false;
    }

    // Activates this configuration.
    public void activate() {
        isActive = true;
    }
}
