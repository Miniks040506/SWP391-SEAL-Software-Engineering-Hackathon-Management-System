package com.t7.seal.repository;

import com.t7.seal.domain.AiSafetyDecision;
import com.t7.seal.entities.AiSafetyLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface AiSafetyLogRepository extends JpaRepository<AiSafetyLog, UUID> {

    Page<AiSafetyLog> findByDecision(AiSafetyDecision decision, Pageable pageable);
}
