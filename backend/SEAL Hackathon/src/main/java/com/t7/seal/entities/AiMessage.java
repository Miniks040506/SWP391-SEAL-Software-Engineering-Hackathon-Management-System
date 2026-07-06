package com.t7.seal.entities;

import com.t7.seal.domain.AiIntent;
import com.t7.seal.domain.AiLanguage;
import com.t7.seal.domain.AiMessageRole;
import com.t7.seal.domain.AiSafetyDecision;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ai_messages",
        indexes = {
                @Index(name = "idx_ai_message_conversation", columnList = "conversation_id"),
                @Index(name = "idx_ai_message_created_at", columnList = "created_at"),
                @Index(name = "idx_ai_message_intent", columnList = "intent")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiMessage {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id", nullable = false)
    private AiConversation conversation;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private AiMessageRole role;

    @Column(columnDefinition = "TEXT", nullable = false)
    private String content;

    @Enumerated(EnumType.STRING)
    @Column(length = 30)
    private AiLanguage language;

    @Enumerated(EnumType.STRING)
    @Column(length = 80)
    private AiIntent intent;

    @Enumerated(EnumType.STRING)
    @Column(name = "safety_decision", length = 30)
    private AiSafetyDecision safetyDecision;

    @Column(name = "provider", length = 80)
    private String provider;

    @Column(name = "model", length = 120)
    private String model;

    @Column(name = "used_rag")
    private Boolean usedRag;

    @Column(name = "retrieval_context", columnDefinition = "TEXT")
    private String retrievalContext;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
