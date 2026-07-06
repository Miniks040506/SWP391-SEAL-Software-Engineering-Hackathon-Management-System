package com.t7.seal.repository;

import com.t7.seal.entities.AiConversation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AiConversationRepository extends JpaRepository<AiConversation, UUID> {

    List<AiConversation> findTop20ByUserIdAndIsActiveTrueOrderByUpdatedAtDesc(UUID userId);

    Optional<AiConversation> findByIdAndUserId(UUID id, UUID userId);
}
