package com.t7.seal.repository;

import com.t7.seal.domain.InvitationStatus;
import com.t7.seal.entities.TeamInvitation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamInvitationRepository extends JpaRepository<TeamInvitation, UUID> {

    Optional<TeamInvitation> findByToken(String token);

    boolean existsByTeamIdAndInviteEmailIgnoreCaseAndStatus(UUID teamId, String inviteEmail, InvitationStatus status);

    List<TeamInvitation> findByTeamIdOrderByCreatedAtDesc(UUID teamId);

    List<TeamInvitation> findByTeamIdAndStatus(UUID teamId, InvitationStatus status);

    List<TeamInvitation> findByInviteEmailIgnoreCaseOrderByCreatedAtDesc(String inviteEmail);
}
