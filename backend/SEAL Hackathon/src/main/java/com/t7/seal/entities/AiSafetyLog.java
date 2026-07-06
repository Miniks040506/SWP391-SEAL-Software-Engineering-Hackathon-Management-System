package com.t7.seal.entities;

import com.t7.seal.domain.AiIntent;
import com.t7.seal.domain.AiSafetyDecision;
import com.t7.seal.domain.AiSafetyRiskType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "ai_safety_logs",
        indexes = {
                @Index(name = "idx_ai_safety_user", columnList = "user_id"),
                @Index(name = "idx_ai_safety_decision", columnList = "decision"),
                @Index(name = "idx_ai_safety_risk", columnList = "risk_type"),
                @Index(name = "idx_ai_safety_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSafetyLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "conversation_id")
    private AiConversation conversation;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private AiSafetyDecision decision;

    @Enumerated(EnumType.STRING)
    @Column(name = "risk_type", nullable = false, length = 50)
    private AiSafetyRiskType riskType;

    @Enumerated(EnumType.STRING)
    @Column(length = 80)
    private AiIntent intent;

    @Column(nullable = false)
    private Integer severity;

    @Column(columnDefinition = "TEXT")
    private String reason;

    @Column(name = "message_hash", length = 64)
    private String messageHash;

    @Column(name = "page_context", length = 500)
    private String pageContext;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;
}
