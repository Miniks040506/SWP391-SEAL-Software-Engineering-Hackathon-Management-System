package com.t7.seal.entities;

import com.t7.seal.domain.AuditActionType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(
        name = "audit_logs",
        indexes = {
                @Index(name = "idx_audit_log_actor", columnList = "actor_id"),
                @Index(name = "idx_audit_log_action_type", columnList = "action_type"),
                @Index(name = "idx_audit_log_target", columnList = "target_table, target_id"),
                @Index(name = "idx_audit_log_created_at", columnList = "created_at")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AuditLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "actor_id", nullable = false)
    private User actor;

    @Enumerated(EnumType.STRING)
    @Column(name = "action_type", nullable = false, length = 100)
    private AuditActionType actionType;

    /**
     * Name of the table affected by this action.
     * This is a polymorphic reference, so it does not use a direct foreign key constraint.
     */
    @Column(name = "target_table", nullable = false, length = 100)
    private String targetTable;

    @Column(name = "target_id", nullable = false)
    private UUID targetId;

    /**
     * State of the target record before the action. NULL for create actions.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "before_state", columnDefinition = "jsonb")
    private Map<String, Object> beforeState;

    /**
     * State of the target record after the action. NULL for delete actions.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "after_state", columnDefinition = "jsonb")
    private Map<String, Object> afterState;

    /**
     * Additional metadata related to the action.
     */
    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "context", columnDefinition = "jsonb")
    private Map<String, Object> context;

    @Column(name = "ip_address", length = 50)
    private String ipAddress;

    @Column(name = "user_agent", length = 500)
    private String userAgent;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    // Lifecycle validation

    @PrePersist
    private void validateBeforeCreate() {
        validateRequiredFields();
    }

    /**
     * Audit logs should not be updated. This protects the append-only behavior at the entity level.
     * Stronger enforcement should also be added at the database or service layer.
     */
    @PreUpdate
    private void preventUpdate() {
        throw new IllegalStateException("AuditLog is append-only and cannot be updated.");
    }

    private void validateRequiredFields() {
        if (actor == null) {
            throw new IllegalStateException("Audit actor is required.");
        }

        if (actionType == null) {
            throw new IllegalStateException("Audit action type is required.");
        }

        if (targetTable == null || targetTable.isBlank()) {
            throw new IllegalStateException("Audit target table is required.");
        }

        if (targetId == null) {
            throw new IllegalStateException("Audit target ID is required.");
        }
    }

    // Helper methods

    /**
     * Checks whether this log has before-state data.
     */
    public boolean hasBeforeState() {
        return beforeState != null && !beforeState.isEmpty();
    }

    /**
     * Checks whether this log has after-state data.
     */
    public boolean hasAfterState() {
        return afterState != null && !afterState.isEmpty();
    }

    /**
     * Checks whether this log has additional context metadata.
     */
    public boolean hasContext() {
        return context != null && !context.isEmpty();
    }

    /**
     * Checks whether this audit log is related to a specific target table.
     */
    public boolean isTargetTable(String tableName) {
        return targetTable != null && targetTable.equalsIgnoreCase(tableName);
    }

    /**
     * Checks whether this action is related to scoring.
     */
    public boolean isScoreAction() {
        return actionType == AuditActionType.SCORE_CREATE
                || actionType == AuditActionType.SCORE_UPDATE;
    }

    /**
     * Checks whether this action is related to result or ranking flow.
     */
    public boolean isResultAction() {
        return actionType == AuditActionType.RANKING_RECALCULATED
                || actionType == AuditActionType.TEAM_ADVANCED
                || actionType == AuditActionType.RESULT_PUBLISHED
                || actionType == AuditActionType.ADVANCEMENT_CONFIRMED;
    }

    /**
     * Checks whether this action is related to disqualification.
     */
    public boolean isDisqualificationAction() {
        return actionType == AuditActionType.TEAM_DISQUALIFIED;
    }
}
