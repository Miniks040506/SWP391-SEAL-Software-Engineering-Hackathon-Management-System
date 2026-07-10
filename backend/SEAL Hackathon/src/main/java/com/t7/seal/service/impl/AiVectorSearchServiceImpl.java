package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.domain.AiKnowledgeVisibility;
import com.t7.seal.domain.UserRole;
import com.t7.seal.entities.AiKnowledgeChunk;
import com.t7.seal.entities.AiKnowledgeDocument;
import com.t7.seal.entities.User;
import com.t7.seal.repository.AiKnowledgeChunkRepository;
import com.t7.seal.service.AiEmbeddingService;
import com.t7.seal.service.AiVectorSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiVectorSearchServiceImpl implements AiVectorSearchService {

    private final JdbcTemplate jdbcTemplate;
    private final AiProviderProperties properties;

    private final AiKnowledgeChunkRepository chunkRepository;

    private final AiEmbeddingService embeddingService;

    @Override
    @Transactional
    public void upsertEmbedding(
            UUID chunkId, float[] embedding,
            String modelName, int dimension
    ) {
        if (!properties.getEmbedding().isPgvectorEnabled()
                || chunkId == null || embedding == null
                || embedding.length == 0
        ) {
            return;
        }
        try {
            jdbcTemplate.update(
                    """
                            INSERT INTO ai_knowledge_chunk_embeddings
                                (id, chunk_id, model_name, dimension, embedding_vector, created_at, updated_at)
                            VALUES
                                (?, ?, ?, ?, ?::vector, NOW(), NOW())
                            ON CONFLICT (chunk_id, model_name)
                            DO UPDATE SET
                                dimension = EXCLUDED.dimension,
                                embedding_vector = EXCLUDED.embedding_vector,
                                updated_at = NOW()
                            """,
                    UUID.randomUUID(),
                    chunkId,
                    modelName,
                    dimension,
                    toPgVector(embedding));
        } catch (Exception ignored) {
            // Do not fail knowledge ingestion if pgvector is not installed or temporarily unavailable.
            ignored.printStackTrace();
        }
    }

    @Override
    @Transactional(readOnly = true)
    public List<AiKnowledgeChunk> search(
            String query, User user,
            int maxChunks, double minScore
    ) {
        if (!properties.getEmbedding().isPgvectorEnabled()
                || query == null || query.isBlank()) {
            return List.of();
        }

        Optional<float[]> queryEmbedding = embeddingService.embed(query);
        if (queryEmbedding.isEmpty()) {
            return List.of();
        }

        List<VectorHit> hits;
        try {
            hits = jdbcTemplate.query("""
                            SELECT c.id AS chunk_id, 1 - (e.embedding_vector <=> ?::vector) AS similarity
                            FROM ai_knowledge_chunk_embeddings e
                            JOIN ai_knowledge_chunks c ON c.id = e.chunk_id
                            JOIN ai_knowledge_documents d ON d.id = c.document_id
                            WHERE c.is_active = TRUE
                              AND d.is_active = TRUE
                              AND e.model_name = ?
                              AND (1 - (e.embedding_vector <=> ?::vector)) >= ?
                            ORDER BY e.embedding_vector <=> ?::vector
                            LIMIT ?
                            """,
                    this::mapHit,
                    toPgVector(queryEmbedding.get()),
                    embeddingService.modelName(),
                    toPgVector(queryEmbedding.get()),
                    minScore,
                    toPgVector(queryEmbedding.get()),
                    Math.max(1, maxChunks * 3)
            );
        } catch (Exception e) {
            return List.of();
        }

        if (hits.isEmpty()) {
            return List.of();
        }

        List<UUID> uuids = hits.stream()
                .map(VectorHit::chunkId)
                .toList();

        Map<UUID, AiKnowledgeChunk> byId = chunkRepository.findByIdIn(uuids)
                .stream()
                .filter(chunk -> isVisible(chunk.getDocument(), user))
                .collect(Collectors.toMap(
                        AiKnowledgeChunk::getId,
                        Function.identity()
                ));

        return hits.stream()
                .map(hit -> byId.get(hit.chunkId()))
                .filter(Objects::nonNull)
                .limit(Math.max(1, maxChunks))
                .toList();
    }

    @Override
    public int reindexAllKnowledge() {
        return 0;
    }

    private VectorHit mapHit(
            ResultSet rs,
            int rowNum
    ) throws SQLException {
        return new VectorHit(
                UUID.fromString(rs.getString("chunk_id")),
                rs.getDouble("similarity")
        );
    }

    private boolean isVisible(AiKnowledgeDocument doc, User user) {
        if (doc == null || !Boolean.TRUE.equals(doc.getIsActive())) {
            return false;
        }

        AiKnowledgeVisibility visibility = doc.getVisibility();
        if (visibility == AiKnowledgeVisibility.PUBLIC
                || visibility == AiKnowledgeVisibility.AUTHENTICATED) {
            return true;
        }

        if (user == null || user.getRole() == null) {
            return false;
        }
        UserRole role = user.getRole();

        return switch (visibility) {
            case STUDENT -> role == UserRole.STUDENT
                    || role == UserRole.ADMIN
                    || role == UserRole.COORDINATOR;
            case JUDGE -> role == UserRole.JUDGE
                    || role == UserRole.ADMIN
                    || role == UserRole.COORDINATOR;
            case MENTOR -> role == UserRole.MENTOR
                    || role == UserRole.ADMIN
                    || role == UserRole.COORDINATOR;
            case COORDINATOR -> role == UserRole.COORDINATOR
                    || role == UserRole.ADMIN;
            case ADMIN, STAFF_ONLY -> role == UserRole.ADMIN;
            default -> true;
        };
    }

    private String toPgVector(float[] values) {
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < values.length; i++) {
            if (i > 0) builder.append(',');
            builder.append(Float.isFinite(values[i]) ? values[i] : 0.0f);
        }
        return builder.append(']').toString();
    }

    private record VectorHit(
            UUID chunkId,
            double score
    ) {
    }
}
