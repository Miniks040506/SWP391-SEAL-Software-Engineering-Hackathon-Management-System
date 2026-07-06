package com.t7.seal.entities;

import com.t7.seal.domain.AiKnowledgeVisibility;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ai_knowledge_documents",
        indexes = {
                @Index(name = "idx_ai_doc_type", columnList = "doc_type"),
                @Index(name = "idx_ai_doc_visibility", columnList = "visibility"),
                @Index(name = "idx_ai_doc_active", columnList = "is_active")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiKnowledgeDocument {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, length = 250)
    private String title;

    @Column(name = "doc_type", nullable = false, length = 80)
    private String docType;

    @Column(name = "source_ref", length = 500)
    private String sourceRef;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AiKnowledgeVisibility visibility;

    @Column(name = "module", length = 120)
    private String module;

    @Column(name = "content_hash", length = 64)
    private String contentHash;

    @Column(name = "is_active", nullable = false)
    @Builder.Default
    private Boolean isActive = true;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "uploaded_by")
    private User uploadedBy;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
