package com.t7.seal.entities;

import com.t7.seal.domain.InvitationStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
        name = "team_invitations",
        uniqueConstraints = {
                @UniqueConstraint(name = "uq_invitation_token", columnNames = "token")
        }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "team_id", nullable = false)
    private Team team;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invited_by", nullable = false)
    private User invitedBy;

    @Column(name = "invite_email", nullable = false)
    private String inviteEmail;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "invitee_user_id")
    private User invitee;

    @Column(nullable = false, length = 100)
    private String token;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private InvitationStatus status = InvitationStatus.PENDING;

    @Column(name = "expires_at", nullable = false)
    private LocalDateTime expiresAt;

    @Column(name = "created_at", nullable = false)
    @Builder.Default
    private LocalDateTime createdAt = LocalDateTime.now();

    @Column(name = "respond_at")
    private LocalDateTime respondAt;

    @Column(name = "response_reason", columnDefinition = "TEXT")
    private String responseReason;

    // Awaiting invitee response — the only state that allows accept/decline/cancel/expire.
    public boolean isPending() {
        return status == InvitationStatus.PENDING;
    }

    // The 48-hour deadline (UC-20) has passed.
    public boolean isExpired(LocalDateTime now) {
        return expiresAt != null && expiresAt.isBefore(now);
    }

    // UC-21: invitee accepts — caller must follow up by creating TeamMember in a transaction.
    public void accept(LocalDateTime now) {
        if (!isPending()) {
            throw new IllegalStateException("Invitation must be pending before acceptance");
        }
        status = InvitationStatus.ACCEPTED;
        respondAt = now;
    }

    // UC-21: invitee declines the invitation.
    public void decline(LocalDateTime now) {
        if (!isPending()) {
            throw new IllegalStateException("Invitation must be pending before decline");
        }
        status = InvitationStatus.DECLINED;
        respondAt = now;
    }

    // UC-20: leader revokes the invite, or system auto-cancels when team becomes full.
    public void cancel(LocalDateTime now) {
        if (!isPending()) {
            throw new IllegalStateException("Invitation must be pending before cancellation");
        }
        status = InvitationStatus.CANCELLED;
        respondAt = now;
    }

    // Background job marks the invite EXPIRED once expiresAt has passed without a response.
    public void expire(LocalDateTime now) {
        if (!isPending()) {
            throw new IllegalStateException("Invitation must be pending before expiration");
        }
        status = InvitationStatus.EXPIRED;
        respondAt = now;
    }
}
