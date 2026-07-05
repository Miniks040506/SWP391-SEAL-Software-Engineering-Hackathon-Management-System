package com.t7.seal.entities;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ai_knowledge_chunks",
        indexes = {
                @Index(name = "idx_ai_chunk_document", columnList = "document_id"),
                @Index(name = "idx_ai_chunk_active", columnList = "is_active"),
                @Index(name = "idx_ai_chunk_module", columnList = "module"),
                @Index(name = "idx_ai_chunk_use_case", columnList = "use_case_id")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiKnowledgeChunk {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "document_id", nullable = false)
    private AiKnowledgeDocument document;

    @Column(name = "chunk_index", nullable = false)
    private Integer chunkIndex;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String content;

    @Column(name = "module", length = 120)
    private String module;

    @Column(name = "use_case_id", length = 80)
    private String useCaseId;

    @Column(name = "role_scope", length = 80)
    private String roleScope;

    @Column(name = "metadata_json", columnDefinition = "TEXT")
    private String metadataJson;

    @Column(name = "embedding_text", columnDefinition = "TEXT")
    private String embeddingText;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
