-- Real AI/RAG support for Period 10 v35.
-- pgvector is optional at runtime: if the database user cannot create extensions,
-- run `CREATE EXTENSION IF NOT EXISTS vector;` manually as a superuser first.
CREATE EXTENSION IF NOT EXISTS vector;

CREATE TABLE IF NOT EXISTS ai_knowledge_chunk_embeddings (
    id UUID PRIMARY KEY,
    chunk_id UUID NOT NULL REFERENCES ai_knowledge_chunks(id) ON DELETE CASCADE,
    model_name VARCHAR(120) NOT NULL,
    dimension INT NOT NULL DEFAULT 1536,
    embedding_vector vector(1536) NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
    CONSTRAINT uk_ai_chunk_embedding_model UNIQUE (chunk_id, model_name)
);

CREATE INDEX IF NOT EXISTS idx_ai_chunk_embedding_chunk
    ON ai_knowledge_chunk_embeddings(chunk_id);

CREATE INDEX IF NOT EXISTS idx_ai_chunk_embedding_model
    ON ai_knowledge_chunk_embeddings(model_name);

-- ivfflat gives fast approximate similarity search after enough rows exist.
-- If the local pgvector version does not support vector_cosine_ops, this index can be skipped safely.
CREATE INDEX IF NOT EXISTS idx_ai_chunk_embedding_vector_cosine
    ON ai_knowledge_chunk_embeddings
    USING ivfflat (embedding_vector vector_cosine_ops)
    WITH (lists = 100);
