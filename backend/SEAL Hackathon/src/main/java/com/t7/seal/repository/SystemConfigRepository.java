package com.t7.seal.repository;

import com.t7.seal.domain.SystemConfigCategory;
import com.t7.seal.entities.SystemConfig;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SystemConfigRepository extends JpaRepository<SystemConfig, UUID> {
    
    Optional<SystemConfig> findByConfigKey(String configKey);

    boolean existsByConfigKey(String configKey);

    List<SystemConfig> findByCategoryOrderByConfigKeyAsc(SystemConfigCategory category);

    List<SystemConfig> findAllByOrderByCategoryAscConfigKeyAsc();
}
