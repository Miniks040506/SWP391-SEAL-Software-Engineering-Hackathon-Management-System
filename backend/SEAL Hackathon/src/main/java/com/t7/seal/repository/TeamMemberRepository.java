package com.t7.seal.repository;

import com.t7.seal.entities.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    List<TeamMember> findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(UUID teamId);

    boolean existsByTeamIdAndUserIdAndLeftAtIsNull(UUID teamId, UUID userId);

    Optional<TeamMember> findByTeamIdAndUserIdAndLeftAtIsNull(UUID teamId, UUID userId);
}
