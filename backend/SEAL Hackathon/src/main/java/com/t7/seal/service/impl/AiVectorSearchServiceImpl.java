package com.t7.seal.service.impl;

import com.t7.seal.entities.AiKnowledgeChunk;
import com.t7.seal.entities.User;
import com.t7.seal.service.AiVectorSearchService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AiVectorSearchServiceImpl implements AiVectorSearchService {
    @Override
    public void upsertEmbedding(UUID chunkId, float[] embedding, String modelName, int dimension) {
        
    }

    @Override
    public List<AiKnowledgeChunk> search(String query, User user, int maxChunks, double minScore) {
        return List.of();
    }

    @Override
    public int reindexAllKnowledge() {
        return 0;
    }
}
