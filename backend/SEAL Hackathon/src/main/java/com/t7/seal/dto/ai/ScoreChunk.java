package com.t7.seal.dto.ai;

import com.t7.seal.entities.AiKnowledgeChunk;

public record ScoreChunk(
        AiKnowledgeChunk chunk,
        double score
) {
}
