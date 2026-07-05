package com.t7.seal.service;

import com.t7.seal.entities.AiKnowledgeChunk;
import com.t7.seal.entities.User;

import java.util.List;
import java.util.UUID;

public interface AiVectorSearchService {

    void upsertEmbedding(UUID chunkId, float[] embedding, String modelName, int dimension);

    List<AiKnowledgeChunk> search(String query, User user, int maxChunks, double minScore);

    int reindexAllKnowledge();
}
