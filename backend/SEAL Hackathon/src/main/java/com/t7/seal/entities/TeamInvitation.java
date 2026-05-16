package com.t7.seal.entities;

import com.t7.seal.domain.InvitationStatus;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CollectionId;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "team_invitation")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TeamInvitation {
    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private UUID teamId;

    @Column(name = "invite_by", nullable = false)
    private UUID invitedBy;

    @Column(name = "invite_email", nullable = false)
    private String inviteEmail;

    @Column(name = "invite_user_id")
    private UUID inviteUserId;

    @Column(unique = true, nullable = false, length = 100)
    private String token;

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
}
