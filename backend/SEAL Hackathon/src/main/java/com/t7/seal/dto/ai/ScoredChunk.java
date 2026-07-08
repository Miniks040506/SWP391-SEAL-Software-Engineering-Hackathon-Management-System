package com.t7.seal.dto.ai;

import com.t7.seal.entities.AiKnowledgeChunk;

public record ScoredChunk(
        AiKnowledgeChunk chunk,
        double score
) {
}
