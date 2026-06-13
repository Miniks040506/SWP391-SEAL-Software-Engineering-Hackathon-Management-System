package com.t7.seal.entities;

import com.t7.seal.domain.LeftReason;
import com.t7.seal.domain.MemberRole;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.OnDelete;
import org.hibernate.annotations.OnDeleteAction;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_member")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamMember {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private MemberRole role = MemberRole.MEMBER;

    @Column(name = "joined_at", nullable = false)
    @Builder.Default
    private LocalDateTime joinedAt = LocalDateTime.now();

    @Column(name = "left_at")
    private LocalDateTime leftAt;

    @Enumerated(EnumType.STRING)
    @Column(name = "left_reason")
    private LeftReason leftReason;

    @Column(name = "left_reason_note", columnDefinition = "TEXT")
    private String leftReasonNote;

    // Checks whether this membership is currently active.
    public boolean isActive() {
        return leftAt == null;
    }

    // Checks whether this member is the team leader.
    public boolean isLeader() {
        return role == MemberRole.LEADER;
    }

    // Marks this member as having left the team.
    public void leave(LocalDateTime now, LeftReason reason) {
        if (!isActive()) {
            throw new IllegalStateException("Team member has already left.");
        }
        leftAt = now;
        leftReason = reason;
    }

    public void leave(LocalDateTime now, LeftReason reason, String reasonNote) {
        leave(now, reason);
        leftReasonNote = reasonNote;
    }

    // N - 1 relationship with User
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id",
            nullable = false,
            updatable = false
    )
    private User user;

    // N - 1 relationship with Team
    @ManyToOne(fetch = FetchType.LAZY, cascade = CascadeType.ALL)
    @JoinColumn(
            name = "team_id",
            nullable = false
    )
    private Team team;
}
