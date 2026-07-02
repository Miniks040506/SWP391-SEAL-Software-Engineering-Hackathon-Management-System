package com.t7.seal.entities;

import com.t7.seal.domain.JudgeType;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "judge")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Judge {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(name = "judge_type", nullable = false)
    private JudgeType judgeType;

    @Column(length = 200)
    private String affiliation;

    @Column(columnDefinition = "TEXT")
    private String bio;

    @Column(name = "expertise_tags", length = 500)
    private String expertiseTags;

    @Column(name = "is_temporary", nullable = false)
    @Builder.Default
    private Boolean isTemporary = false;

    @Column(name = "expires_at")
    private LocalDateTime expiresAt;

    // Guest judge (RQ3 grouping) — distinguishes external evaluators.
    public boolean isGuest() {
        return judgeType == JudgeType.GUEST;
    }

    // UC-08: temporary guest judge is still usable when expiresAt is in the future (or unset).
    public boolean isTemporaryActive(LocalDateTime now) {
        return Boolean.TRUE.equals(isTemporary) && (expiresAt == null || expiresAt.isAfter(now));
    }

    // Spec invariant: temporary judges should carry an expires_at value.
    public boolean requiresExpiry() {
        return Boolean.TRUE.equals(isTemporary);
    }

    // Convert a temporary judge into a permanent one (clears the expiry).
    public void markPermanent() {
        isTemporary = false;
        expiresAt = null;
    }

    // Immediately expires temporary access, typically after the related event has been completed for 24 hours.
    public void expireTemporaryAccess(LocalDateTime now) {
        expiresAt = now == null ? LocalDateTime.now() : now;
    }

    // 1 - 1 to User
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(
            name = "user_id",
            nullable = false
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    private User user;
}
