package com.t7.seal.entities;

import com.t7.seal.domain.SystemConfigCategory;
import com.t7.seal.domain.ValueType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "system_config")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemConfig {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private Long id;

    @Column(name = "config_key", unique = true, nullable = false, length = 200)
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

    @Column(name = "updated_by", nullable = false)
    private UUID updatedBy;

    @Column(name = "created_by", nullable = false)
    @Builder.Default
    private LocalDateTime createdBy = LocalDateTime.now();

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updateAt;
}
