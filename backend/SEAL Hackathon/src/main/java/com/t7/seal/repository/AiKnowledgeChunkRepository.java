package com.t7.seal.repository;

import com.t7.seal.entities.AiKnowledgeChunk;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface AiKnowledgeChunkRepository extends JpaRepository<AiKnowledgeChunk, UUID> {

    List<AiKnowledgeChunk> findByIsActiveTrueOrderByCreatedAtDesc();

    List<AiKnowledgeChunk> findByDocumentIdOrderByChunkIndexAsc(UUID documentId);

    List<AiKnowledgeChunk> findByIdIn(List<UUID> ids);
}
