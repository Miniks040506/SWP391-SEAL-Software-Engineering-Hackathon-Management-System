package com.t7.seal.repository;

import com.t7.seal.entities.AiMessage;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiMessageRepository extends JpaRepository<AiMessage, UUID> {

    List<AiMessage> findTop50ByConversationIdOrderByCreatedAtDesc(UUID conversationId);
}
