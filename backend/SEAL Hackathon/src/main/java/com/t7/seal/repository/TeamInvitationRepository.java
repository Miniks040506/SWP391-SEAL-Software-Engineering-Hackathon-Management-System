package com.t7.seal.repository;

import com.t7.seal.domain.InvitationStatus;
import com.t7.seal.domain.TeamInvitationType;
import com.t7.seal.entities.TeamInvitation;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {

    Optional<TeamInvitation> findByToken(String token);

    Optional<TeamInvitation> findByTokenAndType(String token, TeamInvitationType type);

    boolean existsByTeamIdAndInviteEmailIgnoreCaseAndStatus(UUID teamId, String inviteEmail, InvitationStatus status);

    boolean existsByTeamIdAndInviteEmailIgnoreCaseAndTypeAndStatusAndExpiresAtAfter(
            UUID teamId,
            String inviteEmail,
            TeamInvitationType type,
            InvitationStatus status,
            LocalDateTime now
    );

    boolean existsByTeamIdAndInviteeIdAndTypeAndStatusAndExpiresAtAfter(
            UUID teamId,
            UUID inviteeId,
            TeamInvitationType type,
            InvitationStatus status,
            LocalDateTime now
    );

    // Treats expired-but-PENDING invitations as no longer blocking a re-invite (see B8: status is computed on read,
    // not persisted, so a plain PENDING check would wrongly block re-inviting an email whose invite has lapsed).
    boolean existsByTeamIdAndInviteEmailIgnoreCaseAndStatusAndExpiresAtAfter(
            UUID teamId, String inviteEmail, InvitationStatus status, LocalDateTime now);

    List<TeamInvitation> findByTeamIdOrderByCreatedAtDesc(UUID teamId);

    List<TeamInvitation> findByTeamIdAndTypeOrderByCreatedAtDesc(UUID teamId, TeamInvitationType type);

    List<TeamInvitation> findByTeamIdAndStatus(UUID teamId, InvitationStatus status);

    List<TeamInvitation> findByTeamIdAndTypeAndStatusOrderByCreatedAtDesc(
            UUID teamId,
            TeamInvitationType type,
            InvitationStatus status
    );

    List<TeamInvitation> findByInviteEmailIgnoreCaseOrderByCreatedAtDesc(String inviteEmail);

    List<TeamInvitation> findByInviteEmailIgnoreCaseAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
            String inviteEmail,
            InvitationStatus status,
            LocalDateTime now
    );

    List<TeamInvitation> findByInviteEmailIgnoreCaseAndTypeAndStatusAndExpiresAtAfterOrderByCreatedAtDesc(
            String inviteEmail,
            TeamInvitationType type,
            InvitationStatus status,
            LocalDateTime now
    );

    List<TeamInvitation> findByInviteeIdAndTypeOrderByCreatedAtDesc(UUID inviteeId, TeamInvitationType type);

    @Query("""
            SELECT i
            FROM TeamInvitation i
            JOIN FETCH i.team t
            JOIN FETCH t.leader l
            JOIN FETCH i.invitedBy ib
            LEFT JOIN FETCH i.invitee iu
            LEFT JOIN FETCH t.track tr
            LEFT JOIN FETCH tr.event e
            WHERE i.id = :id AND i.type = :type
            """)
    Optional<TeamInvitation> findDetailByIdAndType(@Param("id") UUID id, @Param("type") TeamInvitationType type);

    @Query("""
            SELECT i
            FROM TeamInvitation i
            JOIN FETCH i.team t
            JOIN FETCH t.leader l
            JOIN FETCH i.invitedBy ib
            LEFT JOIN FETCH i.invitee iu
            LEFT JOIN FETCH t.track tr
            LEFT JOIN FETCH tr.event e
            WHERE i.token = :token AND i.type = :type
            """)
    Optional<TeamInvitation> findDetailByTokenAndType(@Param("token") String token, @Param("type") TeamInvitationType type);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM TeamInvitation i
            JOIN FETCH i.team t
            JOIN FETCH t.leader l
            JOIN FETCH i.invitedBy ib
            LEFT JOIN FETCH i.invitee iu
            LEFT JOIN FETCH t.track tr
            LEFT JOIN FETCH tr.event e
            WHERE i.id = :id AND i.type = :type
            """)
    Optional<TeamInvitation> findLockedDetailByIdAndType(
            @Param("id") UUID id,
            @Param("type") TeamInvitationType type
    );

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("""
            SELECT i
            FROM TeamInvitation i
            JOIN FETCH i.team t
            JOIN FETCH t.leader l
            JOIN FETCH i.invitedBy ib
            LEFT JOIN FETCH i.invitee iu
            LEFT JOIN FETCH t.track tr
            LEFT JOIN FETCH tr.event e
            WHERE i.token = :token AND i.type = :type
            """)
    Optional<TeamInvitation> findLockedDetailByTokenAndType(
            @Param("token") String token,
            @Param("type") TeamInvitationType type
    );
}
