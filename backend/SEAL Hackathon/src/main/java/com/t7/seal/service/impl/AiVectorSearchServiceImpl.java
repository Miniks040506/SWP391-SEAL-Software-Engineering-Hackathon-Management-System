package com.t7.seal.service.impl;

import com.t7.seal.config.AiProviderProperties;
import com.t7.seal.entities.AiKnowledgeChunk;
import com.t7.seal.entities.User;
import com.t7.seal.service.AiVectorSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiVectorSearchServiceImpl implements AiVectorSearchService {

    private final JdbcTemplate jdbcTemplate;
    private final AiProviderProperties properties;

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
    public List<AiKnowledgeChunk> search(String query, User user, int maxChunks, double minScore) {
        return List.of();
    }

    @Override
    public int reindexAllKnowledge() {
        return 0;
    }

    private String toPgVector(float[] values) {
        StringBuilder builder = new StringBuilder("[");
        for (int i = 0; i < values.length; i++) {
            if (i > 0) builder.append(',');
            builder.append(Float.isFinite(values[i]) ? values[i] : 0.0f);
        }
        return builder.append(']').toString();
    }
}
