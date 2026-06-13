package com.t7.seal.repository;

import com.t7.seal.entities.TeamMember;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface TeamMemberRepository extends JpaRepository<TeamMember, UUID> {

    List<TeamMember> findByTeamIdAndLeftAtIsNullOrderByJoinedAtAsc(UUID teamId);

    boolean existsByTeamIdAndUserIdAndLeftAtIsNull(UUID teamId, UUID userId);

    Optional<TeamMember> findByTeamIdAndUserIdAndLeftAtIsNull(UUID teamId, UUID userId);

    @Query("""
            SELECT COUNT(m) > 0
            FROM TeamMember m
            JOIN m.team t
            WHERE m.user.id = :userId
              AND m.leftAt IS NULL
              AND t.id <> :teamId
              AND t.track IS NOT NULL
              AND t.track.id = :trackId
            """)
    boolean existsActiveMembershipInSameTrack(
            @Param("userId") UUID userId,
            @Param("teamId") UUID teamId,
            @Param("trackId") UUID trackId
    );
}
